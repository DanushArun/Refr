from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import (
    health_check, register_user, parse_resume, 
    CompanyViewSet, SeekerProfileViewSet, ReferrerProfileViewSet,
    ContentCardViewSet, ReferralViewSet
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'seekers', SeekerProfileViewSet)
router.register(r'referrers', ReferrerProfileViewSet)
router.register(r'content', ContentCardViewSet)
router.register(r'referrals', ReferralViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('api/users/register/', register_user, name='register_user'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/resume/parse/', parse_resume, name='parse_resume'),
    path('api/v1/', include(router.urls)),
]
