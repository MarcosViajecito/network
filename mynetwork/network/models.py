from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("self", symmetrical=False, related_name="following")
    
    def serialize(self, user = None):
        data = {
            "username": self.username,
            "followers": self.followers.count(),
            "following": self.following.count(),
            "posts": self.posts.count()
        }
        if user:
            data["isfollowing"] = user in self.followers.all()
            data["sameUser"] = user == self
        return data


class Post(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    content = models.TextField(blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, through="Like", related_name="liked_posts")
    edited = models.BooleanField(default=False)        
    
    def serialize(self, user=None ):
        data = {
            "user": self.user.username,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes.count(),    
            "id": self.id,
            "numerictime": self.timestamp.timestamp(),
            "edited": self.edited            
        }
        if user: 
            data["liked"] = Like.objects.filter(user=user, post=self).exists()
            data["editable"] = user == self.user.id

        return data
    
class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
