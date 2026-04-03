from rest_framework import serializers
from .models import User, Company, SeekerProfile, ReferrerProfile, ContentCard, Referral

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'display_name', 'phone', 'avatar_url')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class SeekerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeekerProfile
        fields = '__all__'

class ReferrerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferrerProfile
        fields = '__all__'

class ContentCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentCard
        fields = '__all__'

class ReferralSerializer(serializers.ModelSerializer):
    class Meta:
        model = Referral
        fields = '__all__'
