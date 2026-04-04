from django.contrib import admin
from django.urls import path
from api.views import (
    health_check,
    register_user,
    parse_resume,
    CustomTokenObtainPairView,
    user_me,
    feed_list,
    feed_events_batch,
    referral_create,
    referral_inbox,
    referral_pipeline,
    referral_transition,
    chat_conversation,
    chat_send_message,
    reputation_me,
    reputation_leaderboard,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Health
    path('health/', health_check, name='health_check'),

    # Auth
    path('api/users/register/', register_user, name='register_user'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Resume parsing
    path('api/resume/parse/', parse_resume, name='parse_resume'),

    # User profile
    path('api/v1/users/me/', user_me, name='user_me'),

    # Feed
    path('api/v1/feed', feed_list, name='feed_list'),
    path('api/v1/feed/events/batch', feed_events_batch, name='feed_events_batch'),

    # Referrals
    path('api/v1/referrals/', referral_create, name='referral_create'),
    path('api/v1/referrals/inbox/', referral_inbox, name='referral_inbox'),
    path('api/v1/referrals/pipeline/', referral_pipeline, name='referral_pipeline'),
    path('api/v1/referrals/<int:pk>/status/', referral_transition, name='referral_transition'),

    # Chat
    path('api/v1/chat/<int:referral_id>/', chat_conversation, name='chat_conversation'),
    path('api/v1/chat/<int:conversation_id>/messages/', chat_send_message, name='chat_send_message'),

    # Reputation
    path('api/v1/reputation/me/', reputation_me, name='reputation_me'),
    path('api/v1/reputation/leaderboard/', reputation_leaderboard, name='reputation_leaderboard'),
]
