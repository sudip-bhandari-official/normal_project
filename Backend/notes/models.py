from django.db import models  # type: ignore[reportMissingModuleSource]
from django.contrib.auth.models import User  # type: ignore[reportMissingModuleSource]

class Note(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=255, blank=True, default="Untitled Note")
    content = models.TextField(blank=True, default="")
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.owner.username})"