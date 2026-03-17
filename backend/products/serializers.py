from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'username', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
        )
        return user


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product CRUD operations."""
    vendor = serializers.ReadOnlyField(source='vendor.username')

    class Meta:
        model = Product
        fields = (
            'id',
            'product_name',
            'description',
            'price',
            'quantity',
            'created_date',
            'vendor',
        )
        read_only_fields = ('id', 'created_date', 'vendor')
