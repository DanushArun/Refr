import math
import random
from datetime import timedelta

from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    User, Company, SeekerProfile, ReferrerProfile,
    ContentCard, Referral, Conversation, Message, BehaviorEvent,
)
from .serializers import (
    UserRegistrationSerializer, UserProfileSerializer,
    FeedCardSerializer, ReferralBaseSerializer,
    ReferrerInboxItemSerializer, SeekerPipelineItemSerializer,
    ConversationSerializer, MessageSerializer,
    ReputationSerializer, LeaderboardEntrySerializer,
    BehaviorEventSerializer,
)


# ─── Auth ───────────────────────────────────────────────────────────────────

class CustomTokenObtainPairView(TokenObtainPairView):
    """Extends SimpleJWT token view to also return user profile data."""

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            username = request.data.get('username', '')
            try:
                user = User.objects.get(username=username)
                response.data['user'] = UserProfileSerializer(user).data
            except User.DoesNotExist:
                pass
        return response


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok'})


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user with optional profile creation.
    Creates User + SeekerProfile/ReferrerProfile in a single transaction.
    Returns JWT tokens + user profile data.
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        with transaction.atomic():
            user = serializer.save()

        # Generate tokens for the new user
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── User Profile ──────────────────────────────────────────────────────────

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_me(request):
    """GET: return authenticated user's full profile.
    PATCH: update user and/or profile fields.
    """
    user = request.user

    if request.method == 'GET':
        return Response({'data': UserProfileSerializer(user).data})

    # PATCH
    data = request.data
    changed = False

    if 'displayName' in data or 'display_name' in data:
        user.display_name = data.get('displayName', data.get('display_name', user.display_name))
        changed = True
    if 'avatarUrl' in data or 'avatar_url' in data:
        user.avatar_url = data.get('avatarUrl', data.get('avatar_url', user.avatar_url))
        changed = True

    if changed:
        user.save()

    # Update profile fields
    if user.role == 'seeker':
        try:
            profile = user.seeker_profile
            seeker_fields = {
                'headline': data.get('headline'),
                'career_story': data.get('careerStory', data.get('career_story')),
                'skills': data.get('skills'),
                'years_of_experience': data.get('yearsOfExperience', data.get('years_of_experience')),
                'target_companies': data.get('targetCompanies', data.get('target_companies')),
                'target_roles': data.get('targetRoles', data.get('target_roles')),
                'is_open_to_work': data.get('isOpenToWork', data.get('is_open_to_work')),
            }
            for field, value in seeker_fields.items():
                if value is not None:
                    setattr(profile, field, value)
            profile.save()
        except SeekerProfile.DoesNotExist:
            pass

    elif user.role == 'referrer':
        try:
            profile = user.referrer_profile
            referrer_fields = {
                'department': data.get('department'),
                'job_title': data.get('jobTitle', data.get('job_title')),
                'can_refer_to': data.get('canReferTo', data.get('can_refer_to')),
                'is_anonymous_posting_enabled': data.get('isAnonymousPostingEnabled'),
            }
            for field, value in referrer_fields.items():
                if value is not None:
                    setattr(profile, field, value)
            profile.save()
        except ReferrerProfile.DoesNotExist:
            pass

    return Response({'data': UserProfileSerializer(user).data})


# ─── Feed ───────────────────────────────────────────────────────────────────

def _compute_feed_score(card, user):
    """Rule-based feed ranking: recency 0.45, relevance 0.35, popularity 0.20."""
    now = timezone.now()
    age_hours = (now - card.created_at).total_seconds() / 3600

    # Recency: exponential decay, 12h half-life
    recency = math.pow(2, -age_hours / 12)

    # Relevance: role-aware scoring
    relevance = 0.5  # default mid-range
    if user.role == 'seeker':
        try:
            seeker = user.seeker_profile
            payload = card.payload or {}
            # Jaccard skill similarity
            card_skills = set(s.lower() for s in payload.get('skills', []))
            user_skills = set(s.lower() for s in (seeker.skills or []))
            if card_skills and user_skills:
                intersection = card_skills & user_skills
                union = card_skills | user_skills
                relevance = len(intersection) / len(union) if union else 0.5

            # Boost if card targets a company the seeker wants
            card_companies = set(c.lower() for c in payload.get('targetCompanies', []))
            target_companies = set(c.lower() for c in (seeker.target_companies or []))
            if card_companies & target_companies:
                relevance = min(1.0, relevance + 0.3)
        except SeekerProfile.DoesNotExist:
            pass
    elif user.role == 'referrer':
        try:
            referrer = user.referrer_profile
            payload = card.payload or {}
            # Boost if seeker targets the referrer's company
            card_targets = set(c.lower() for c in payload.get('targetCompanies', []))
            if referrer.company and referrer.company.name.lower() in card_targets:
                relevance = 0.9
        except ReferrerProfile.DoesNotExist:
            pass

    # Popularity: log-normalised reaction count, saturates at 500
    popularity = math.log(1 + min(card.reaction_count, 500)) / math.log(501)

    return 0.45 * recency + 0.35 * relevance + 0.20 * popularity


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def feed_list(request):
    """Ranked, cursor-paginated feed.
    Query params: cursor (id), limit (default 20, max 50).
    Response: { data: FeedCard[], meta: { cursor, hasMore } }
    """
    cursor = request.query_params.get('cursor')
    limit = min(int(request.query_params.get('limit', 20)), 50)
    pool_size = min(limit * 5, 200)

    queryset = ContentCard.objects.filter(is_removed=False).order_by('-created_at')

    if cursor:
        try:
            cursor_card = ContentCard.objects.get(id=cursor)
            queryset = queryset.filter(created_at__lt=cursor_card.created_at)
        except ContentCard.DoesNotExist:
            pass

    pool = list(queryset[:pool_size])

    # Score and rank
    user = request.user
    scored = [(card, _compute_feed_score(card, user)) for card in pool]
    scored.sort(key=lambda x: x[1], reverse=True)

    page = scored[:limit]
    cards = [card for card, _ in page]
    has_more = len(pool) > limit

    next_cursor = str(cards[-1].id) if cards and has_more else None

    return Response({
        'data': FeedCardSerializer(cards, many=True).data,
        'meta': {
            'cursor': next_cursor,
            'hasMore': has_more,
        },
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def feed_events_batch(request):
    """Ingest up to 50 behavior events. Fire-and-forget."""
    events = request.data.get('events', [])
    if not events:
        return Response({'status': 'ok'})

    events = events[:50]
    user = request.user

    objs = []
    for event in events:
        objs.append(BehaviorEvent(
            user=user,
            event_type=event.get('eventType', ''),
            card_id=event.get('cardId'),
            card_type=event.get('cardType', ''),
            position_in_feed=event.get('positionInFeed'),
            duration_ms=event.get('durationMs'),
            action=event.get('action', ''),
            payload=event.get('payload'),
            timestamp=event.get('timestamp', timezone.now()),
        ))

    BehaviorEvent.objects.bulk_create(objs, ignore_conflicts=True)
    return Response({'status': 'ok'})


# ─── Referrals ──────────────────────────────────────────────────────────────

# Valid state transitions for the referral state machine
VALID_TRANSITIONS = {
    'requested': ['accepted', 'rejected', 'withdrawn', 'expired'],
    'accepted': ['submitted', 'withdrawn'],
    'submitted': ['interviewing', 'rejected', 'withdrawn'],
    'interviewing': ['hired', 'rejected', 'withdrawn'],
}


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def referral_create(request):
    """Create a referral request from a feed card.
    Body: { feedCardId, targetRole, seekerNote? }
    """
    user = request.user

    try:
        seeker_profile = user.seeker_profile
    except SeekerProfile.DoesNotExist:
        return Response(
            {'error': 'Seeker profile required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    feed_card_id = request.data.get('feedCardId')
    target_role = request.data.get('targetRole', 'Software Engineer')
    seeker_note = request.data.get('seekerNote', '')

    # Find a referrer to assign (from the feed card or random)
    referrer_profile = None
    company = None

    if feed_card_id:
        try:
            card = ContentCard.objects.get(id=feed_card_id)
            if card.author and hasattr(card.author, 'referrer_profile'):
                referrer_profile = card.author.referrer_profile
                company = referrer_profile.company
        except ContentCard.DoesNotExist:
            pass

    # Fallback: pick a random referrer
    if not referrer_profile:
        referrer_profile = ReferrerProfile.objects.order_by('?').first()
        if not referrer_profile:
            return Response(
                {'error': 'No referrers available'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    if not company:
        company = referrer_profile.company

    # Calculate match score (placeholder: 60-90)
    match_score = random.randint(60, 90)

    with transaction.atomic():
        referral = Referral.objects.create(
            seeker=seeker_profile,
            referrer=referrer_profile,
            company=company,
            target_role=target_role,
            match_score=match_score,
            seeker_note=seeker_note,
            feed_card_id=feed_card_id,
        )

        # Auto-create conversation
        Conversation.objects.create(referral=referral)

    return Response(
        {'data': ReferralBaseSerializer(referral).data},
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def referral_inbox(request):
    """Referrer's incoming referral requests (active statuses)."""
    user = request.user
    try:
        referrer_profile = user.referrer_profile
    except ReferrerProfile.DoesNotExist:
        return Response({'data': []})

    active_statuses = ['requested', 'accepted', 'submitted', 'interviewing']
    referrals = Referral.objects.filter(
        referrer=referrer_profile,
        status__in=active_statuses,
    ).select_related(
        'seeker', 'seeker__user', 'company',
    ).order_by('-requested_at')

    return Response({
        'data': ReferrerInboxItemSerializer(referrals, many=True).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def referral_pipeline(request):
    """Seeker's full referral pipeline."""
    user = request.user
    try:
        seeker_profile = user.seeker_profile
    except SeekerProfile.DoesNotExist:
        return Response({'data': []})

    referrals = Referral.objects.filter(
        seeker=seeker_profile,
    ).select_related(
        'referrer', 'referrer__user', 'referrer__company', 'company',
    ).order_by('-requested_at')

    return Response({
        'data': SeekerPipelineItemSerializer(referrals, many=True).data,
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def referral_transition(request, pk):
    """Advance referral state machine.
    Body: { status, note? }
    """
    try:
        referral = Referral.objects.select_related(
            'seeker', 'seeker__user', 'referrer', 'referrer__user', 'company',
        ).get(id=pk)
    except Referral.DoesNotExist:
        return Response(
            {'error': 'Referral not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    new_status = request.data.get('status')
    note = request.data.get('note', '')

    if not new_status:
        return Response(
            {'error': 'status is required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    current = referral.status
    valid_next = VALID_TRANSITIONS.get(current, [])

    if new_status not in valid_next:
        return Response(
            {'error': f'Cannot transition from {current} to {new_status}. Valid: {valid_next}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    now = timezone.now()
    referral.status = new_status

    if new_status == 'accepted':
        referral.accepted_at = now
    elif new_status == 'submitted':
        referral.submitted_at = now
        # Update referrer stats
        referrer = referral.referrer
        referrer.total_referrals += 1
        referrer.kingmaker_score += 2
        referrer.save()
    elif new_status == 'interviewing':
        referral.interviewing_at = now
    elif new_status in ('hired', 'rejected', 'withdrawn', 'expired'):
        referral.outcome_at = now
        if new_status == 'hired':
            referrer = referral.referrer
            referrer.successful_hires += 1
            referrer.kingmaker_score += 10
            referrer.save()

    if note:
        referral.referrer_note = note

    referral.save()

    return Response({
        'data': ReferralBaseSerializer(referral).data,
    })


# ─── Chat ───────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_conversation(request, referral_id):
    """Get conversation + message history for a referral."""
    try:
        conversation = Conversation.objects.select_related('referral').get(
            referral_id=referral_id,
        )
    except Conversation.DoesNotExist:
        # Auto-create if missing
        try:
            referral = Referral.objects.get(id=referral_id)
            conversation = Conversation.objects.create(referral=referral)
        except Referral.DoesNotExist:
            return Response(
                {'error': 'Referral not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

    return Response({
        'data': ConversationSerializer(conversation).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_send_message(request, conversation_id):
    """Send a message in a conversation.
    Body: { body }
    """
    body = request.data.get('body', '').strip()
    if not body or len(body) > 4000:
        return Response(
            {'error': 'Message body must be 1-4000 characters'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response(
            {'error': 'Conversation not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    message = Message.objects.create(
        conversation=conversation,
        sender=request.user,
        body=body,
    )

    return Response({
        'data': MessageSerializer(message).data,
    }, status=status.HTTP_201_CREATED)


# ─── Reputation ─────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reputation_me(request):
    """Authenticated referrer's own Kingmaker profile."""
    user = request.user
    try:
        referrer = user.referrer_profile
    except ReferrerProfile.DoesNotExist:
        # Return empty rep for seekers
        return Response({'data': {
            'kingmakerScore': 0,
            'totalReferrals': 0,
            'successfulHires': 0,
            'department': '',
            'jobTitle': '',
            'verificationStatus': 'pending',
            'user': {'id': str(user.id), 'displayName': user.display_name},
            'company': {'id': '', 'name': ''},
        }})

    referrer = ReferrerProfile.objects.select_related('user', 'company').get(id=referrer.id)
    return Response({
        'data': ReputationSerializer(referrer).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reputation_leaderboard(request):
    """Global or company-scoped Kingmaker leaderboard."""
    company_id = request.query_params.get('companyId')

    queryset = ReferrerProfile.objects.select_related('user', 'company').order_by(
        '-kingmaker_score', '-successful_hires',
    )

    if company_id:
        queryset = queryset.filter(company_id=company_id)

    top = queryset[:20]
    return Response({
        'data': LeaderboardEntrySerializer(top, many=True).data,
    })


# ─── Resume parsing (Vertex AI) ────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def parse_resume(request):
    from .services.vertex_ai import VertexAIService

    resume_text = request.data.get('resume_text', '')
    if not resume_text:
        return Response(
            {'error': 'resume_text is required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    service = VertexAIService()
    result = service.analyze_resume(resume_text)
    return Response({'result': result})
