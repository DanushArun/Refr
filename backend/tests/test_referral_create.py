import pytest
from rest_framework.test import APIClient

from api.models import (
    Company, ContentCard, Referral, ReferrerProfile, SeekerProfile, User,
)

REFERRAL_URL = "/api/v1/referrals/"


@pytest.fixture
def seeker_user(db) -> User:
    user = User.objects.create_user(
        username="rc_seeker@test.com",
        email="rc_seeker@test.com",
        password="testpass123",
        display_name="RC Seeker",
        role="seeker",
    )
    SeekerProfile.objects.create(
        user=user,
        headline="Looking",
        career_story="Story",
        skills=["Python"],
        years_of_experience=2,
        target_companies=["RcCorp"],
        target_roles=["Engineer"],
    )
    return user


@pytest.fixture
def company(db) -> Company:
    return Company.objects.create(name="RcCorp", domain="rccorp.com")


@pytest.fixture
def referrer_user(db, company: Company) -> User:
    user = User.objects.create_user(
        username="rc_referrer@test.com",
        email="rc_referrer@test.com",
        password="testpass123",
        display_name="RC Referrer",
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
def endorser_card(db, referrer_user: User) -> ContentCard:
    return ContentCard.objects.create(
        type="company_intel",
        author=referrer_user,
        company=referrer_user.referrer_profile.company,
        payload={"title": "Intel", "body": "Body"},
    )


@pytest.fixture
def seeker_authored_card(db, seeker_user: User) -> ContentCard:
    return ContentCard.objects.create(
        type="career_story",
        author=seeker_user,
        payload={"headline": "h", "story": "s", "skills": [], "targetRoles": [], "targetCompanies": []},
    )


def _seeker_client(seeker_user: User) -> APIClient:
    client = APIClient()
    client.force_authenticate(user=seeker_user)
    return client


class TestReferralCreate:
    @pytest.mark.django_db
    def test_missing_feed_card_id_returns_400(self, seeker_user: User) -> None:
        client = _seeker_client(seeker_user)
        response = client.post(REFERRAL_URL, {"targetRole": "Backend"}, format="json")
        assert response.status_code == 400
        assert "feedCardId" in response.data["error"]

    @pytest.mark.django_db
    def test_unknown_feed_card_returns_404(self, seeker_user: User) -> None:
        client = _seeker_client(seeker_user)
        response = client.post(
            REFERRAL_URL, {"feedCardId": 999999, "targetRole": "Backend"}, format="json",
        )
        assert response.status_code == 404

    @pytest.mark.django_db
    def test_card_with_non_referrer_author_returns_400(
        self, seeker_user: User, seeker_authored_card: ContentCard,
    ) -> None:
        """Seeker-authored card has no endorser — request must be rejected."""
        client = _seeker_client(seeker_user)
        response = client.post(
            REFERRAL_URL,
            {"feedCardId": seeker_authored_card.id, "targetRole": "Backend"},
            format="json",
        )
        assert response.status_code == 400
        assert "endorser" in response.data["error"].lower()

    @pytest.mark.django_db
    def test_self_endorsement_returns_400(
        self, referrer_user: User, endorser_card: ContentCard,
    ) -> None:
        """A user who is the card's author cannot request endorsement from themselves.

        We give the referrer a seeker_profile so the seeker_profile guard passes,
        and ensure the self-endorsement check still rejects the request.
        """
        SeekerProfile.objects.create(
            user=referrer_user,
            headline="dual-role",
            career_story="story",
            skills=[],
            years_of_experience=0,
            target_companies=[],
            target_roles=[],
        )
        client = APIClient()
        client.force_authenticate(user=referrer_user)
        response = client.post(
            REFERRAL_URL,
            {"feedCardId": endorser_card.id, "targetRole": "Backend"},
            format="json",
        )
        assert response.status_code == 400
        assert "yourself" in response.data["error"].lower()

    @pytest.mark.django_db
    def test_valid_request_returns_201(
        self, seeker_user: User, endorser_card: ContentCard,
    ) -> None:
        client = _seeker_client(seeker_user)
        response = client.post(
            REFERRAL_URL,
            {"feedCardId": endorser_card.id, "targetRole": "Senior Backend"},
            format="json",
        )
        assert response.status_code == 201
        assert response.data["data"]["status"] == "requested"

    @pytest.mark.django_db
    def test_duplicate_request_returns_409(
        self, seeker_user: User, endorser_card: ContentCard,
    ) -> None:
        client = _seeker_client(seeker_user)
        first = client.post(
            REFERRAL_URL,
            {"feedCardId": endorser_card.id, "targetRole": "Backend"},
            format="json",
        )
        assert first.status_code == 201
        second = client.post(
            REFERRAL_URL,
            {"feedCardId": endorser_card.id, "targetRole": "Backend"},
            format="json",
        )
        assert second.status_code == 409

    @pytest.mark.django_db
    def test_daily_cap_returns_429(self, seeker_user: User, company: Company) -> None:
        """After 5 referrals in the last 24h, the 6th must return 429."""
        # Create 5 distinct endorser cards so unique_together doesn't trigger first.
        seeker = seeker_user.seeker_profile
        for i in range(5):
            other_company = Company.objects.create(name=f"Cap{i}", domain=f"cap{i}.com")
            other_user = User.objects.create_user(
                username=f"cap{i}@test.com",
                email=f"cap{i}@test.com",
                password="testpass123",
                display_name=f"Cap {i}",
                role="referrer",
            )
            ReferrerProfile.objects.create(
                user=other_user,
                company=other_company,
                department="Eng",
                job_title="SE",
                years_at_company=1,
                can_refer_to=[],
            )
            Referral.objects.create(
                seeker=seeker,
                referrer=other_user.referrer_profile,
                company=other_company,
                target_role="Backend",
                match_score=80,
            )

        # 6th attempt against a fresh endorser must be capped.
        sixth_company = Company.objects.create(name="Sixth", domain="sixth.com")
        sixth_user = User.objects.create_user(
            username="sixth@test.com",
            email="sixth@test.com",
            password="testpass123",
            display_name="Sixth",
            role="referrer",
        )
        ReferrerProfile.objects.create(
            user=sixth_user,
            company=sixth_company,
            department="Eng",
            job_title="SE",
            years_at_company=1,
            can_refer_to=[],
        )
        sixth_card = ContentCard.objects.create(
            type="company_intel",
            author=sixth_user,
            company=sixth_company,
            payload={"title": "t", "body": "b"},
        )

        client = _seeker_client(seeker_user)
        response = client.post(
            REFERRAL_URL,
            {"feedCardId": sixth_card.id, "targetRole": "Backend"},
            format="json",
        )
        assert response.status_code == 429
        assert "retryAfterSeconds" in response.data
