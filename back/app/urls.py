from django.urls import path

from . import views

urlpatterns = [
    path('main', views.files_list, name='files_list'),
    path('file', views.file, name='file'),
]