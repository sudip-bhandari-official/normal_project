from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from notes.views import NoteListCreateView, NoteDetailView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/notes/', NoteListCreateView.as_view(), name='note-list-create'),
    path('api/notes/<int:pk>/', NoteDetailView.as_view(), name='note-detail'),
]