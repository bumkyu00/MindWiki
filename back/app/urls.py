from django.urls import path

from . import views

urlpatterns = [
    path('main', views.files_list, name='files_list'),
    path('file', views.create_file, name='create_file'),
    path('file/<int:file_id>', views.file, name='file'),
]