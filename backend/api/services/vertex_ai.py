from django.conf import settings


class VertexAIService:
    def __init__(self):
        self.project = settings.GOOGLE_CLOUD_PROJECT_ID
        self.location = settings.GOOGLE_CLOUD_LOCATION
        self.enabled = bool(
            self.project
            and self.location
            and settings.GOOGLE_APPLICATION_CREDENTIALS
        )

    def analyze_resume(self, text_content: str) -> dict:
        if not self.enabled:
            return {
                "error": "Vertex AI not configured",
                "message": "Set GOOGLE_APPLICATION_CREDENTIALS in .env",
            }

        try:
            from google import genai

            client = genai.Client(
                project=self.project,
                location=self.location,
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
        except Exception as e:
            return {"error": str(e)}
