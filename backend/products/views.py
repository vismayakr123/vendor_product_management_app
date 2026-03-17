from rest_framework import generics, viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Product
from .serializers import RegisterSerializer, ProductSerializer


class RegisterView(generics.CreateAPIView):
    """Register a new vendor (user)."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'id': user.id,
                'username': user.username,
                'message': 'Vendor registered successfully.',
            },
            status=status.HTTP_201_CREATED,
        )


class ProductViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for products.
    Each vendor can only access their own products.
    """
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return only the logged-in vendor's products."""
        return Product.objects.filter(vendor=self.request.user)

    def perform_create(self, serializer):
        """Automatically assign the vendor to the product."""
        serializer.save(vendor=self.request.user)
