from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'vendor', 'price', 'quantity', 'created_date')
    list_filter = ('vendor', 'created_date')
    search_fields = ('product_name',)
