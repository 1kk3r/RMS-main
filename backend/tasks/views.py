from django.shortcuts import render

# Create your views here.
# views.py
from django.http import JsonResponse
from .models import Task

def task_list(request):
    tasks = Task.objects.all().values()
    return JsonResponse(list(tasks), safe=False)