import json
import logging
from pathlib import Path

from django.conf import settings
from google.oauth2.service_account import Credentials

logger = logging.getLogger('api')

VERTEX_SCOPES = ['https://www.googleapis.com/auth/cloud-platform']


def _load_credentials() -> Credentials | None:
    cred_path = settings.GOOGLE_VERTEX_CREDENTIALS_PATH
    if not cred_path:
        return None
    path = Path(cred_path)
    if not path.is_file():
        logger.error("GCP credentials file not found: %s", cred_path)
        return None
    try:
        return Credentials.from_service_account_file(
            str(path), scopes=VERTEX_SCOPES,
        )
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("Invalid GCP credentials file: %s", exc)
        return None


class VertexAIService:
    def __init__(self):
        self.project = settings.GOOGLE_CLOUD_PROJECT_ID
        self.location = settings.GOOGLE_CLOUD_LOCATION
        self.credentials = _load_credentials()
        self.enabled = bool(
            self.project and self.location and self.credentials
        )

    def analyze_resume(self, text_content: str) -> dict:
        if not self.enabled:
            return {
                "error": "Vertex AI not configured",
                "message": "Set GOOGLE_VERTEX_CREDENTIALS_PATH in .env",
            }

        try:
            from google import genai

            client = genai.Client(
                project=self.project,
                location=self.location,
                credentials=self.credentials,
            )
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=(
                    "Extract skills, years of experience, and target roles "
                    "from this resume. Return JSON.\n\n"
                    f"Resume:\n{text_content}"
                ),
            )
            return response.text
        except Exception as exc:
            logger.error("Vertex AI resume parse failed: %s", exc)
            return {"error": str(exc)}
