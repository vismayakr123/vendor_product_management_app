from django.db import models
from django.contrib.auth.models import User


class Product(models.Model):
    """Product owned by a vendor (User)."""
    product_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)
    vendor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='products',
    )

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return self.product_name
