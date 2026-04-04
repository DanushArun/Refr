from django.contrib import admin
from .models import (
    User, Company, SeekerProfile, ReferrerProfile,
    ContentCard, Referral, Conversation, Message,
    BehaviorEvent, ModerationQueue,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'display_name', 'role', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email', 'display_name')


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'domain', 'employee_count_range', 'created_at')
    search_fields = ('name', 'domain')


@admin.register(SeekerProfile)
class SeekerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'headline', 'years_of_experience', 'is_open_to_work')
    list_filter = ('is_open_to_work',)
    search_fields = ('user__display_name', 'headline')


@admin.register(ReferrerProfile)
class ReferrerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'job_title', 'kingmaker_score', 'total_referrals', 'successful_hires')
    list_filter = ('verification_status', 'company')
    search_fields = ('user__display_name', 'company__name')


@admin.register(ContentCard)
class ContentCardAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'author', 'score', 'reaction_count', 'is_removed', 'created_at')
    list_filter = ('type', 'is_removed')
    search_fields = ('payload',)


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ('id', 'seeker', 'referrer', 'company', 'target_role', 'status', 'match_score', 'requested_at')
    list_filter = ('status', 'company')
    search_fields = ('target_role',)


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'referral', 'created_at')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'body_preview', 'created_at')
    search_fields = ('body',)

    def body_preview(self, obj):
        return obj.body[:80] + '...' if len(obj.body) > 80 else obj.body


@admin.register(BehaviorEvent)
class BehaviorEventAdmin(admin.ModelAdmin):
    list_display = ('user', 'event_type', 'card_type', 'action', 'timestamp')
    list_filter = ('event_type', 'card_type')


@admin.register(ModerationQueue)
class ModerationQueueAdmin(admin.ModelAdmin):
    list_display = ('content_card', 'reason', 'status', 'reported_by', 'created_at')
    list_filter = ('status',)
