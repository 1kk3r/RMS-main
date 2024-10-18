from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=50)
    category = models.CharField(max_length=50)
    sizes = models.JSONField()  # Store sizes as a JSON array
    code = models.CharField(max_length=20)
    image = models.ImageField(upload_to='product_images/', null=True, blank=True)

    def __str__(self):
        return self.name