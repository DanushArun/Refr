import pytest
from rest_framework.test import APIClient
from api.models import User, Company, SeekerProfile, ReferrerProfile, ContentCard


@pytest.fixture
def seeker_user(db):
    user = User.objects.create_user(
        username='seeker@test.com',
        email='seeker@test.com',
        password='testpass123',
        display_name='Test Seeker',
        role='seeker',
    )
    SeekerProfile.objects.create(
        user=user,
        headline='Test headline',
        career_story='Test story',
        skills=['Python', 'React'],
        years_of_experience=3,
        target_companies=['TestCorp'],
        target_roles=['Engineer'],
    )
    return user


@pytest.fixture
def referrer_user(db):
    company = Company.objects.create(name='TestCorp', domain='testcorp.com')
    user = User.objects.create_user(
        username='referrer@test.com',
        email='referrer@test.com',
        password='testpass123',
        display_name='Test Referrer',
        role='referrer',
    )
    ReferrerProfile.objects.create(
        user=user,
        company=company,
        department='Engineering',
        job_title='Senior Engineer',
        years_at_company=2,
        can_refer_to=['Backend', 'Frontend'],
    )
    return user


@pytest.fixture
def seeker_client(seeker_user):
    client = APIClient()
    client.force_authenticate(user=seeker_user)
    return client


@pytest.fixture
def referrer_client(referrer_user):
    client = APIClient()
    client.force_authenticate(user=referrer_user)
    return client


@pytest.mark.django_db
def test_register_user():
    client = APIClient()
    response = client.post('/api/users/register/', {
        'username': 'new@test.com',
        'email': 'new@test.com',
        'password': 'testpass123',
        'display_name': 'New User',
        'role': 'seeker',
        'headline': 'A test headline',
        'skills': ['Python'],
    }, format='json')
    assert response.status_code == 201
    assert 'access' in response.data
    assert 'refresh' in response.data
    assert response.data['user']['displayName'] == 'New User'
    assert response.data['user']['role'] == 'seeker'


@pytest.mark.django_db
def test_user_me(seeker_client):
    response = seeker_client.get('/api/v1/users/me/')
    assert response.status_code == 200
    data = response.data['data']
    assert data['displayName'] == 'Test Seeker'
    assert data['role'] == 'seeker'
    assert data['seekerProfile']['headline'] == 'Test headline'


@pytest.mark.django_db
def test_feed_returns_cards(seeker_client, seeker_user):
    ContentCard.objects.create(
        type='career_story',
        author=seeker_user,
        payload={'seekerName': 'Test', 'headline': 'Test', 'story': 'Test',
                 'skills': [], 'targetRoles': [], 'targetCompanies': []},
    )
    response = seeker_client.get('/api/v1/feed')
    assert response.status_code == 200
    assert len(response.data['data']) >= 1
    assert 'meta' in response.data


@pytest.mark.django_db
def test_referral_pipeline_empty(seeker_client):
    response = seeker_client.get('/api/v1/referrals/pipeline/')
    assert response.status_code == 200
    assert response.data['data'] == []


@pytest.mark.django_db
def test_referral_inbox(referrer_client):
    response = referrer_client.get('/api/v1/referrals/inbox/')
    assert response.status_code == 200
    assert response.data['data'] == []


@pytest.mark.django_db
def test_reputation_me(referrer_client):
    response = referrer_client.get('/api/v1/reputation/me/')
    assert response.status_code == 200
    assert 'kingmakerScore' in response.data['data']


@pytest.mark.django_db
def test_leaderboard(referrer_client):
    response = referrer_client.get('/api/v1/reputation/leaderboard/')
    assert response.status_code == 200
    assert isinstance(response.data['data'], list)


@pytest.mark.django_db
def test_feed_events_batch(seeker_client):
    response = seeker_client.post('/api/v1/feed/events/batch', {
        'events': [
            {'eventType': 'card_viewed', 'cardType': 'career_story', 'timestamp': '2026-04-04T00:00:00Z'},
        ],
    }, format='json')
    assert response.status_code == 200
