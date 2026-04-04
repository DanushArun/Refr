from rest_framework import serializers
from django.utils import timezone
from .models import (
    User, Company, SeekerProfile, ReferrerProfile,
    ContentCard, Referral, Conversation, Message, BehaviorEvent,
)


# ─── Company ────────────────────────────────────────────────────────────────

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ('id', 'name', 'logo_url', 'domain', 'employee_count_range')


# ─── User & Profile ────────────────────────────────────────────────────────

class UserRegistrationSerializer(serializers.Serializer):
    """Handles user registration with optional profile creation."""
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    display_name = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(choices=['seeker', 'referrer'])

    # Seeker profile fields (optional)
    headline = serializers.CharField(max_length=120, required=False, default='')
    career_story = serializers.CharField(required=False, default='')
    skills = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    years_of_experience = serializers.IntegerField(required=False, default=0)
    current_company = serializers.CharField(required=False, default='', allow_blank=True)
    target_companies = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    target_roles = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    why_looking = serializers.CharField(required=False, default='', allow_blank=True)

    # Referrer profile fields (optional)
    company = serializers.CharField(required=False, default='', allow_blank=True)
    department = serializers.CharField(required=False, default='', allow_blank=True)
    job_title = serializers.CharField(required=False, default='', allow_blank=True)
    years_at_company = serializers.IntegerField(required=False, default=0)
    can_refer_to = serializers.ListField(child=serializers.CharField(), required=False, default=list)

    def create(self, validated_data):
        role = validated_data['role']

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            display_name=validated_data['display_name'],
            role=role,
        )

        if role == 'seeker':
            SeekerProfile.objects.create(
                user=user,
                headline=validated_data.get('headline', ''),
                career_story=validated_data.get('why_looking', ''),
                skills=validated_data.get('skills', []),
                years_of_experience=validated_data.get('years_of_experience', 0),
                current_company=validated_data.get('current_company', ''),
                target_companies=validated_data.get('target_companies', []),
                target_roles=validated_data.get('target_roles', []),
            )
        elif role == 'referrer':
            company_name = validated_data.get('company', '')
            company_obj = None
            if company_name:
                company_obj, _ = Company.objects.get_or_create(
                    name=company_name,
                    defaults={'domain': f'{company_name.lower().replace(" ", "")}.com'},
                )
            SeekerProfile.objects.get_or_create(
                user=user,
                defaults={
                    'headline': '',
                    'career_story': '',
                    'skills': [],
                    'years_of_experience': 0,
                    'target_companies': [],
                    'target_roles': [],
                },
            )
            if company_obj:
                ReferrerProfile.objects.create(
                    user=user,
                    company=company_obj,
                    department=validated_data.get('department', ''),
                    job_title=validated_data.get('job_title', ''),
                    years_at_company=validated_data.get('years_at_company', 0),
                    can_refer_to=validated_data.get('can_refer_to', []),
                )

        return user


class SeekerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeekerProfile
        fields = (
            'headline', 'career_story', 'skills', 'years_of_experience',
            'current_company', 'target_companies', 'target_roles',
            'resume_url', 'is_open_to_work',
        )


class ReferrerProfileSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)

    class Meta:
        model = ReferrerProfile
        fields = (
            'company', 'department', 'job_title', 'years_at_company',
            'can_refer_to', 'kingmaker_score', 'total_referrals',
            'successful_hires', 'verification_status', 'is_anonymous_posting_enabled',
        )


class UserProfileSerializer(serializers.ModelSerializer):
    """Returns user data merged with their profile fields.
    Frontend expects a flat object with id, email, displayName, role, + profile fields.
    """
    displayName = serializers.CharField(source='display_name')
    avatarUrl = serializers.URLField(source='avatar_url', allow_null=True)

    # Nested profile data
    seekerProfile = serializers.SerializerMethodField()
    referrerProfile = serializers.SerializerMethodField()

    # Flattened convenience fields
    headline = serializers.SerializerMethodField()
    kingmakerScore = serializers.SerializerMethodField()
    jobTitle = serializers.SerializerMethodField()
    companyName = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'email', 'displayName', 'role', 'avatarUrl',
            'seekerProfile', 'referrerProfile',
            'headline', 'kingmakerScore', 'jobTitle', 'companyName',
        )

    def get_seekerProfile(self, obj):
        try:
            return SeekerProfileSerializer(obj.seeker_profile).data
        except SeekerProfile.DoesNotExist:
            return None

    def get_referrerProfile(self, obj):
        try:
            return ReferrerProfileSerializer(obj.referrer_profile).data
        except ReferrerProfile.DoesNotExist:
            return None

    def get_headline(self, obj):
        try:
            return obj.seeker_profile.headline
        except SeekerProfile.DoesNotExist:
            return None

    def get_kingmakerScore(self, obj):
        try:
            return obj.referrer_profile.kingmaker_score
        except ReferrerProfile.DoesNotExist:
            return None

    def get_jobTitle(self, obj):
        try:
            return obj.referrer_profile.job_title
        except ReferrerProfile.DoesNotExist:
            return None

    def get_companyName(self, obj):
        try:
            return obj.referrer_profile.company.name
        except (ReferrerProfile.DoesNotExist, AttributeError):
            return None


# ─── Feed / Content Cards ──────────────────────────────────────────────────

class FeedCardSerializer(serializers.ModelSerializer):
    """Serializes ContentCard into the FeedCard discriminated union shape
    expected by the frontend (@refr/shared types).
    """

    class Meta:
        model = ContentCard
        fields = ('id', 'type', 'created_at', 'updated_at', 'score', 'reaction_count')

    def to_representation(self, instance):
        base = super().to_representation(instance)
        payload = instance.payload or {}

        # Merge payload fields into the base representation
        # This creates the discriminated union shape the frontend expects
        card = {
            'id': str(base['id']),
            'type': base['type'],
            'createdAt': base['created_at'],
            'updatedAt': base['updated_at'],
            'score': base['score'],
            'reactionCount': base['reaction_count'],
            'isBookmarked': False,
        }

        if base['type'] == 'career_story':
            card.update({
                'seekerId': payload.get('seekerId', ''),
                'seekerName': payload.get('seekerName', ''),
                'seekerAvatar': payload.get('seekerAvatar'),
                'headline': payload.get('headline', ''),
                'story': payload.get('story', ''),
                'skills': payload.get('skills', []),
                'yearsOfExperience': payload.get('yearsOfExperience', 0),
                'targetRoles': payload.get('targetRoles', []),
                'targetCompanies': payload.get('targetCompanies', []),
            })
        elif base['type'] == 'company_intel':
            card.update({
                'companyId': payload.get('companyId', ''),
                'companyName': payload.get('companyName', ''),
                'companyLogo': payload.get('companyLogo'),
                'authorLabel': payload.get('authorLabel', 'Verified employee'),
                'title': payload.get('title', ''),
                'body': payload.get('body', ''),
                'tags': payload.get('tags', []),
            })
        elif base['type'] == 'referral_event':
            card.update({
                'referrerDisplayName': payload.get('referrerDisplayName', ''),
                'seekerDisplayName': payload.get('seekerDisplayName', ''),
                'companyName': payload.get('companyName', ''),
                'eventDescription': payload.get('eventDescription', ''),
            })
        elif base['type'] == 'milestone':
            card.update({
                'title': payload.get('title', ''),
                'description': payload.get('description', ''),
                'relatedUserId': payload.get('relatedUserId'),
            })
        elif base['type'] == 'editorial':
            card.update({
                'title': payload.get('title', ''),
                'body': payload.get('body', ''),
                'author': payload.get('author', ''),
                'tags': payload.get('tags', []),
            })

        return card


# ─── Referrals ──────────────────────────────────────────────────────────────

class ReferralBaseSerializer(serializers.ModelSerializer):
    """Base referral serializer with camelCase field names."""

    class Meta:
        model = Referral
        fields = '__all__'

    def to_representation(self, instance):
        return {
            'id': str(instance.id),
            'seekerId': str(instance.seeker_id),
            'referrerId': str(instance.referrer_id),
            'companyId': str(instance.company_id),
            'targetRole': instance.target_role,
            'status': instance.status,
            'matchScore': instance.match_score,
            'requestedAt': instance.requested_at.isoformat() if instance.requested_at else None,
            'acceptedAt': instance.accepted_at.isoformat() if instance.accepted_at else None,
            'submittedAt': instance.submitted_at.isoformat() if instance.submitted_at else None,
            'interviewingAt': instance.interviewing_at.isoformat() if instance.interviewing_at else None,
            'outcomeAt': instance.outcome_at.isoformat() if instance.outcome_at else None,
            'seekerNote': instance.seeker_note,
            'referrerNote': instance.referrer_note,
            'feedCardId': str(instance.feed_card_id) if instance.feed_card_id else None,
        }


class ReferrerInboxItemSerializer(serializers.Serializer):
    """Shape: { referral, seekerName, seekerHeadline, seekerAvatar, matchScore }"""

    def to_representation(self, instance):
        seeker_profile = instance.seeker
        seeker_user = seeker_profile.user
        return {
            'referral': ReferralBaseSerializer(instance).data,
            'seekerName': seeker_user.display_name,
            'seekerHeadline': seeker_profile.headline,
            'seekerAvatar': seeker_user.avatar_url,
            'matchScore': instance.match_score or 75,
        }


class SeekerPipelineItemSerializer(serializers.Serializer):
    """Shape: { referral, referrerName, companyName, companyLogo }"""

    def to_representation(self, instance):
        referrer_profile = instance.referrer
        return {
            'referral': ReferralBaseSerializer(instance).data,
            'referrerName': referrer_profile.user.display_name,
            'companyName': instance.company.name,
            'companyLogo': instance.company.logo_url,
        }


# ─── Chat ───────────────────────────────────────────────────────────────────

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ('id', 'body', 'created_at', 'sender')

    def to_representation(self, instance):
        return {
            'id': str(instance.id),
            'body': instance.body,
            'createdAt': instance.created_at.isoformat(),
            'sender': {
                'id': str(instance.sender_id),
                'displayName': instance.sender.display_name,
                'avatarUrl': instance.sender.avatar_url,
            },
        }

    def get_sender(self, obj):
        return {
            'id': str(obj.sender_id),
            'displayName': obj.sender.display_name,
            'avatarUrl': obj.sender.avatar_url,
        }


class ConversationSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ('id', 'created_at', 'messages')

    def to_representation(self, instance):
        messages = instance.messages.select_related('sender').order_by('created_at')
        return {
            'id': str(instance.id),
            'createdAt': instance.created_at.isoformat(),
            'messages': [MessageSerializer(m).data for m in messages],
        }

    def get_messages(self, obj):
        return []


# ─── Reputation ─────────────────────────────────────────────────────────────

class ReputationSerializer(serializers.Serializer):
    """Shape for /api/v1/reputation/me/"""

    def to_representation(self, instance):
        # instance is a ReferrerProfile
        return {
            'kingmakerScore': instance.kingmaker_score,
            'totalReferrals': instance.total_referrals,
            'successfulHires': instance.successful_hires,
            'department': instance.department,
            'jobTitle': instance.job_title,
            'verificationStatus': instance.verification_status,
            'user': {
                'id': str(instance.user_id),
                'displayName': instance.user.display_name,
            },
            'company': {
                'id': str(instance.company_id),
                'name': instance.company.name,
            },
        }


class LeaderboardEntrySerializer(serializers.Serializer):
    """Shape for leaderboard entries."""

    def to_representation(self, instance):
        return {
            'kingmakerScore': instance.kingmaker_score,
            'totalReferrals': instance.total_referrals,
            'successfulHires': instance.successful_hires,
            'user': {
                'id': str(instance.user_id),
                'displayName': instance.user.display_name,
            },
            'company': {
                'id': str(instance.company_id),
                'name': instance.company.name,
            },
        }


# ─── Behavior Events ───────────────────────────────────────────────────────

class BehaviorEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = BehaviorEvent
        fields = ('event_type', 'card_id', 'card_type', 'position_in_feed',
                  'duration_ms', 'action', 'payload', 'timestamp')
