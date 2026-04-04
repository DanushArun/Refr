import pytest
from rest_framework.test import APIClient

from api.models import (
    Company,
    Conversation,
    Referral,
    ReferrerProfile,
    SeekerProfile,
    User,
)


@pytest.fixture
def company(db) -> Company:
    return Company.objects.create(name="AuthTestCorp", domain="authtestcorp.com")


@pytest.fixture
def seeker_user(db) -> User:
    user = User.objects.create_user(
        username="auth_seeker@test.com",
        email="auth_seeker@test.com",
        password="testpass123",
        display_name="Auth Seeker",
        role="seeker",
    )
    SeekerProfile.objects.create(
        user=user,
        headline="Auth test seeker",
        career_story="Testing authorization",
        skills=["Python", "Django"],
        years_of_experience=3,
        target_companies=["AuthTestCorp"],
        target_roles=["Engineer"],
    )
    return user


@pytest.fixture
def referrer_user(db, company: Company) -> User:
    user = User.objects.create_user(
        username="auth_referrer@test.com",
        email="auth_referrer@test.com",
        password="testpass123",
        display_name="Auth Referrer",
        role="referrer",
    )
    ReferrerProfile.objects.create(
        user=user,
        company=company,
        department="Engineering",
        job_title="Senior Engineer",
        years_at_company=2,
        can_refer_to=["Backend"],
    )
    return user


@pytest.fixture
def outsider_user(db) -> User:
    """An authenticated user who is NOT a participant on any referral."""
    user = User.objects.create_user(
        username="outsider@test.com",
        email="outsider@test.com",
        password="testpass123",
        display_name="Outsider",
        role="seeker",
    )
    SeekerProfile.objects.create(
        user=user,
        headline="Outsider profile",
        career_story="Not involved",
        skills=["Go"],
        years_of_experience=1,
        target_companies=["OtherCorp"],
        target_roles=["DevOps"],
    )
    return user


@pytest.fixture
def referral(
    seeker_user: User, referrer_user: User, company: Company
) -> Referral:
    return Referral.objects.create(
        seeker=seeker_user.seeker_profile,
        referrer=referrer_user.referrer_profile,
        company=company,
        target_role="Backend Engineer",
        status="requested",
        match_score=80,
    )


@pytest.fixture
def conversation(referral: Referral) -> Conversation:
    return Conversation.objects.create(referral=referral)


def _make_client(user: User) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=user)
    return client


class TestReferralTransitionAuthorization:
    """Authorization checks for PATCH /api/v1/referrals/<id>/status/."""

    @pytest.mark.django_db
    def test_referral_transition_by_participant_succeeds(
        self,
        referrer_user: User,
        referral: Referral,
        conversation: Conversation,
    ) -> None:
        client = _make_client(referrer_user)
        response = client.patch(
            f"/api/v1/referrals/{referral.id}/status/",
            {"status": "accepted"},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["data"]["status"] == "accepted"

    @pytest.mark.django_db
    def test_referral_transition_by_non_participant_returns_403(
        self,
        outsider_user: User,
        referral: Referral,
        conversation: Conversation,
    ) -> None:
        client = _make_client(outsider_user)
        response = client.patch(
            f"/api/v1/referrals/{referral.id}/status/",
            {"status": "accepted"},
            format="json",
        )
        assert response.status_code == 403

    @pytest.mark.django_db
    def test_referral_transition_invalid_state_returns_400(
        self,
        referrer_user: User,
        referral: Referral,
        conversation: Conversation,
    ) -> None:
        client = _make_client(referrer_user)
        response = client.patch(
            f"/api/v1/referrals/{referral.id}/status/",
            {"status": "hired"},
            format="json",
        )
        assert response.status_code == 400


class TestChatConversationAuthorization:
    """Authorization checks for GET /api/v1/chat/<referralId>/."""

    @pytest.mark.django_db
    def test_chat_view_by_participant_succeeds(
        self,
        seeker_user: User,
        referral: Referral,
        conversation: Conversation,
    ) -> None:
        client = _make_client(seeker_user)
        response = client.get(f"/api/v1/chat/{referral.id}/")
        assert response.status_code == 200
        assert "data" in response.data

    @pytest.mark.django_db
    def test_chat_view_by_non_participant_returns_403(
        self,
        outsider_user: User,
        referral: Referral,
        conversation: Conversation,
    ) -> None:
        client = _make_client(outsider_user)
        response = client.get(f"/api/v1/chat/{referral.id}/")
        assert response.status_code == 403


class TestChatSendMessageAuthorization:
    """Authorization checks for POST /api/v1/chat/<conversationId>/messages/."""

    @pytest.mark.django_db
    def test_chat_send_by_participant_succeeds(
        self,
        referrer_user: User,
        referral: Referral,
        conversation: Conversation,
    ) -> None:
        client = _make_client(referrer_user)
        response = client.post(
            f"/api/v1/chat/{conversation.id}/messages/",
            {"body": "Hello, I can refer you."},
            format="json",
        )
        assert response.status_code == 201
        assert response.data["data"]["body"] == "Hello, I can refer you."

    @pytest.mark.django_db
    def test_chat_send_by_non_participant_returns_403(
        self,
        outsider_user: User,
        referral: Referral,
        conversation: Conversation,
    ) -> None:
        client = _make_client(outsider_user)
        response = client.post(
            f"/api/v1/chat/{conversation.id}/messages/",
            {"body": "I should not be able to send this."},
            format="json",
        )
        assert response.status_code == 403
