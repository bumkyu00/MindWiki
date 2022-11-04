from django.db import models
from django.conf import settings

class File(models.Model):
    name = models.CharField(max_length=20)
    zoom_ratio = models.FloatField(default=1)
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    node_width = models.FloatField(default=2)
    node_height = models.FloatField(default=2)
    last_id = models.IntegerField(default=0)
    selected_id = models.IntegerField(default=None, null=True)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, models.CASCADE, default=None, null=True)

class Node(models.Model):
    local_id = models.IntegerField(default=0)
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    width = models.FloatField(default=2)
    height = models.FloatField(default=2)
    text = models.CharField(max_length=200)

    file = models.ForeignKey('File', models.CASCADE)

class Leaf(models.Model):
    local_id = models.IntegerField(default=0)
    parent_id = models.IntegerField(default=None, null=True)
    leaf_size = models.IntegerField(default=1)
    offset_x = models.FloatField(default=0)
    offset_y = models.FloatField(default=0)

    file = models.ForeignKey('File', models.CASCADE)
