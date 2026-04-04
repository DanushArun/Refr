from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        SEEKER = 'seeker', _('Seeker')
        REFERRER = 'referrer', _('Referrer')

    phone = models.CharField(max_length=20, blank=True, null=True, unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.SEEKER)
    display_name = models.CharField(max_length=150)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)

class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    employee_count_range = models.CharField(max_length=50, blank=True, null=True)
    domain = models.CharField(max_length=255, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class SeekerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seeker_profile')
    headline = models.CharField(max_length=120)
    career_story = models.TextField()
    skills = models.JSONField(default=list)  # Storing array of strings
    years_of_experience = models.IntegerField()
    current_company = models.CharField(max_length=255, blank=True, null=True)
    target_companies = models.JSONField(default=list)
    target_roles = models.JSONField(default=list)
    resume_url = models.URLField(max_length=500, blank=True, null=True)
    is_open_to_work = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

class ReferrerProfile(models.Model):
    class VerificationStatus(models.TextChoices):
        PENDING = 'pending', _('Pending')
        VERIFIED = 'verified', _('Verified')
        FAILED = 'failed', _('Failed')
        SKIPPED = 'skipped', _('Skipped')

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='referrer_profile')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='referrer_profiles')
    department = models.CharField(max_length=255)
    job_title = models.CharField(max_length=255)
    years_at_company = models.IntegerField()
    can_refer_to = models.JSONField(default=list)
    kingmaker_score = models.IntegerField(default=0)
    total_referrals = models.IntegerField(default=0)
    successful_hires = models.IntegerField(default=0)
    verification_status = models.CharField(max_length=20, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)
    is_anonymous_posting_enabled = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

class ContentCard(models.Model):
    class ContentType(models.TextChoices):
        CAREER_STORY = 'career_story', _('Career Story')
        COMPANY_INTEL = 'company_intel', _('Company Intel')
        REFERRAL_EVENT = 'referral_event', _('Referral Event')
        MILESTONE = 'milestone', _('Milestone')
        EDITORIAL = 'editorial', _('Editorial')

    type = models.CharField(max_length=50, choices=ContentType.choices, db_index=True)
    score = models.FloatField(default=0)
    reaction_count = models.IntegerField(default=0)
    payload = models.JSONField()
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='content_cards')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='content_cards')
    is_removed = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type} #{self.id}"

class Referral(models.Model):
    class ReferralStatus(models.TextChoices):
        REQUESTED = 'requested', _('Requested')
        ACCEPTED = 'accepted', _('Accepted')
        SUBMITTED = 'submitted', _('Submitted')
        INTERVIEWING = 'interviewing', _('Interviewing')
        HIRED = 'hired', _('Hired')
        REJECTED = 'rejected', _('Rejected')
        WITHDRAWN = 'withdrawn', _('Withdrawn')
        EXPIRED = 'expired', _('Expired')

    seeker = models.ForeignKey(SeekerProfile, on_delete=models.CASCADE, related_name='referrals')
    referrer = models.ForeignKey(ReferrerProfile, on_delete=models.CASCADE, related_name='referrals')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='referrals')
    target_role = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=ReferralStatus.choices, default=ReferralStatus.REQUESTED, db_index=True)
    match_score = models.IntegerField(default=0)
    seeker_note = models.CharField(max_length=500, blank=True, null=True)
    referrer_note = models.TextField(blank=True, null=True)
    feed_card = models.ForeignKey(ContentCard, on_delete=models.SET_NULL, null=True, blank=True, related_name='referrals')

    requested_at = models.DateTimeField(auto_now_add=True, db_index=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    interviewing_at = models.DateTimeField(null=True, blank=True)
    outcome_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [('seeker', 'referrer', 'company')]
        ordering = ['-requested_at']

    def __str__(self):
        return f"Referral #{self.id} ({self.status})"

class Conversation(models.Model):
    referral = models.OneToOneField(Referral, on_delete=models.CASCADE, related_name='conversation')
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class BehaviorEvent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='behavior_events')
    event_type = models.CharField(max_length=50, db_index=True)
    card_id = models.BigIntegerField(null=True, blank=True)
    card_type = models.CharField(max_length=50, null=True, blank=True)
    position_in_feed = models.IntegerField(null=True, blank=True)
    duration_ms = models.IntegerField(null=True, blank=True)
    action = models.CharField(max_length=50, null=True, blank=True)
    payload = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(db_index=True)

class ModerationQueue(models.Model):
    class ModerationStatus(models.TextChoices):
        PENDING = 'pending', _('Pending')
        APPROVED = 'approved', _('Approved')
        REJECTED = 'rejected', _('Rejected')
        REMOVED = 'removed', _('Removed')

    content_card = models.ForeignKey(ContentCard, on_delete=models.CASCADE, related_name='moderation_items')
    reason = models.CharField(max_length=500)
    status = models.CharField(max_length=20, choices=ModerationStatus.choices, default=ModerationStatus.PENDING)
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reported_moderation_items')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_moderation_items')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
