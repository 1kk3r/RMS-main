from django.shortcuts import render
from rest_framework import viewsets
from .models import Product
from .serializer import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all()
        name = self.request.query_params.get('name', None)
        type = self.request.query_params.get('type', None)
        category = self.request.query_params.get('category', None)
        size = self.request.query_params.get('size', None)

        if name:
            queryset = queryset.filter(name__icontains=name)
        if type:
            queryset = queryset.filter(type=type)
        if category:
            queryset = queryset.filter(category=category)
        if size:
            queryset = queryset.filter(sizes__contains=size)

        return queryset