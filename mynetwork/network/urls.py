
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("yell", views.yell, name="yell"),
    path("loadyells/", views.loadyells, name="loadyells"),
    path("like/<int:post_id>", views.like, name="like"),
    path("profileposts/<str:username>/", views.profileposts, name="profileposts"),
    path("follow/<str:username>", views.follow, name="follow"),
    path("following/", views.following, name="following"),
    path("edit", views.edit, name="edit"),

    path("user/<str:username>", views.user, name="otheruser"),
    path("user", views.user, name="user"),

]
