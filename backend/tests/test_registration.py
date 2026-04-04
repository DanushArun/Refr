import pytest
from rest_framework.test import APIClient

from api.models import User

REGISTER_URL = "/api/users/register/"


def _seeker_payload(**overrides: object) -> dict:
    """Build a valid seeker registration payload, with optional overrides."""
    base: dict = {
        "username": "seeker@test.com",
        "email": "seeker@test.com",
        "password": "testpass123",
        "display_name": "Test Seeker",
        "role": "seeker",
        "headline": "Backend engineer looking for growth",
        "skills": ["Python", "Django"],
    }
    base.update(overrides)
    return base


def _referrer_payload(**overrides: object) -> dict:
    """Build a valid referrer registration payload, with optional overrides."""
    base: dict = {
        "username": "referrer@test.com",
        "email": "referrer@test.com",
        "password": "testpass123",
        "display_name": "Test Referrer",
        "role": "referrer",
        "company": "Razorpay",
        "department": "Engineering",
        "job_title": "Senior Engineer",
        "years_at_company": 2,
        "can_refer_to": ["Backend", "Frontend"],
    }
    base.update(overrides)
    return base


class TestRegistrationValidation:
    """Integration tests for POST /api/users/register/ validation."""

    @pytest.mark.django_db
    def test_register_seeker_succeeds(self) -> None:
        client = APIClient()
        response = client.post(
            REGISTER_URL,
            _seeker_payload(),
            format="json",
        )
        assert response.status_code == 201
        assert "access" in response.data
        assert "refresh" in response.data
        assert "user" in response.data
        assert response.data["user"]["role"] == "seeker"

    @pytest.mark.django_db
    def test_register_referrer_with_company_succeeds(self) -> None:
        client = APIClient()
        response = client.post(
            REGISTER_URL,
            _referrer_payload(),
            format="json",
        )
        assert response.status_code == 201
        assert "access" in response.data
        assert "refresh" in response.data
        assert "user" in response.data
        assert response.data["user"]["role"] == "referrer"
        assert response.data["user"]["companyName"] == "Razorpay"

    @pytest.mark.django_db
    def test_register_duplicate_username_returns_400(self) -> None:
        client = APIClient()
        client.post(REGISTER_URL, _seeker_payload(), format="json")
        response = client.post(
            REGISTER_URL,
            _seeker_payload(email="other@test.com"),
            format="json",
        )
        assert response.status_code == 400
        assert "username" in response.data

    @pytest.mark.django_db
    def test_register_duplicate_email_returns_400(self) -> None:
        client = APIClient()
        client.post(REGISTER_URL, _seeker_payload(), format="json")
        response = client.post(
            REGISTER_URL,
            _seeker_payload(username="different@test.com"),
            format="json",
        )
        assert response.status_code == 400
        assert "email" in response.data

    @pytest.mark.django_db
    def test_register_referrer_without_company_returns_400(self) -> None:
        client = APIClient()
        response = client.post(
            REGISTER_URL,
            _referrer_payload(company=""),
            format="json",
        )
        assert response.status_code == 400
        assert "company" in response.data

    @pytest.mark.django_db
    def test_register_missing_password_returns_400(self) -> None:
        client = APIClient()
        payload = _seeker_payload()
        del payload["password"]
        response = client.post(REGISTER_URL, payload, format="json")
        assert response.status_code == 400
        assert "password" in response.data

    @pytest.mark.django_db
    def test_register_short_password_returns_400(self) -> None:
        client = APIClient()
        response = client.post(
            REGISTER_URL,
            _seeker_payload(password="abc"),
            format="json",
        )
        assert response.status_code == 400
        assert "password" in response.data

    @pytest.mark.django_db
    def test_register_negative_experience_returns_400(self) -> None:
        client = APIClient()
        response = client.post(
            REGISTER_URL,
            _seeker_payload(years_of_experience=-3),
            format="json",
        )
        assert response.status_code == 400
        assert "years_of_experience" in response.data
