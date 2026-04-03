import pytest
from rest_framework.test import APIClient
from api.models import Company

@pytest.mark.django_db
def test_companies_api():
    client = APIClient()
    response = client.get('/api/v1/companies/')
    assert response.status_code == 200

@pytest.mark.django_db
def test_parse_resume_api_requires_text():
    client = APIClient()
    response = client.post('/api/resume/parse/', {})
    assert response.status_code == 400
    assert 'resume_text is required' in response.data['error']
