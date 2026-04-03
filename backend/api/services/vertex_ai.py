import os
from google.cloud import aiplatform
from django.conf import settings

class VertexAIService:
    def __init__(self):
        project = settings.GOOGLE_CLOUD_PROJECT_ID
        location = settings.GOOGLE_CLOUD_LOCATION
        
        # Initialize Vertex AI SDK if credentials and project are present
        if project and location and settings.GOOGLE_VERTEX_CREDENTIALS_JSON:
            aiplatform.init(project=project, location=location)
            
    def analyze_resume(self, text_content):
        if not settings.GOOGLE_VERTEX_CREDENTIALS_JSON:
            return {"error": "Missing Vertex AI credentials", "message": "Failed to parse"}
            
        try:
            from google import genai
            
            client = genai.Client(
                project=settings.GOOGLE_CLOUD_PROJECT_ID,
                location=settings.GOOGLE_CLOUD_LOCATION
            )
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=f"Extract the following information from this resume and return it as JSON: skills, years of experience, target roles. Resume: {text_content}"
            )
            return response.text
        except Exception as e:
            return {"error": str(e), "message": "Failed to parse with Vertex AI. Please verify credentials."}
