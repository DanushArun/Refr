from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, viewsets
from .serializers import UserSerializer, CompanySerializer, SeekerProfileSerializer, ReferrerProfileSerializer, ContentCardSerializer, ReferralSerializer
from .models import User, Company, SeekerProfile, ReferrerProfile, ContentCard, Referral
from .services.vertex_ai import VertexAIService

@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok'})

@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def parse_resume(request):
    """
    Endpoint to test Vertex AI integration.
    """
    resume_text = request.data.get('resume_text', '')
    if not resume_text:
        return Response({"error": "resume_text is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    service = VertexAIService()
    result = service.analyze_resume(resume_text)
    
    return Response({"result": result})

# ViewSets for CRUD
class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

class SeekerProfileViewSet(viewsets.ModelViewSet):
    queryset = SeekerProfile.objects.all()
    serializer_class = SeekerProfileSerializer

class ReferrerProfileViewSet(viewsets.ModelViewSet):
    queryset = ReferrerProfile.objects.all()
    serializer_class = ReferrerProfileSerializer

class ContentCardViewSet(viewsets.ModelViewSet):
    queryset = ContentCard.objects.all()
    serializer_class = ContentCardSerializer

class ReferralViewSet(viewsets.ModelViewSet):
    queryset = Referral.objects.all()
    serializer_class = ReferralSerializer
