from django.urls import path

from . import views

urlpatterns = [
    path('main', views.files_list, name='files_list'),
    path('file/<int:file_id>', views.file, name='file'),
]