from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.core.paginator import Paginator
from django.shortcuts import render, get_object_or_404, redirect 
from django.urls import reverse
from functools import wraps 
import json


from .models import User, Post, Like


def custom_login_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')  # Redirigir a la página de inicio de sesión
        return view_func(request, *args, **kwargs)
    return _wrapped_view


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@custom_login_required
def yell(request):
    if request.method == "POST":
        data = json.loads(request.body)        
        post = Post(
            content=data.get("content", ""),
            user=request.user
        )            

        post.save()
        return JsonResponse(post.serialize())
    



def loadpost(request, post_id):

    # Fetch post
    post = Post.objects.get(pk=post_id)
    if post == None:
        return JsonResponse({
            "error": "Invalid user and/or post"
        }, status=400)

    # Retrieve post
    if request.method == "GET":
        return JsonResponse(post.serialize())
    
    # Edit post content
    elif request.method == "PUT":

        # Check for invalid user/post
        if request.user.username != post.user:
            return JsonResponse({
                "error": "Invalid user and/or post"
            }, status=400)
        
        # Check data is not empty
        data = json.loads(request.body)
        if data.get("content") in ["", None]:
            return JsonResponse({
                "error": "Invalid empty post"
            }, status=400)
        
        post.edited = True
        post.content = data.get("content")
        post.save()
        return JsonResponse({
            "message": "Post edited correctly"
        }, status = 200)


@login_required
def like(request, post_id):
    user = request.user
    post = Post.objects.get(pk=post_id)
    like, created = Like.objects.get_or_create(user = user, post= post)
    if created:
        like.save()
    else: 
        like.delete()
    return JsonResponse(data="", safe=False)


def loadyells(request):                                     # Load index page posts
    
    posts = Post.objects.order_by('-id')
    p = Paginator(posts, 10)
    page = request.GET.get('page')
    showPosts = p.get_page(page)
    logged = True
    if request.user.is_authenticated:
        user = request.user.id # Passes request user to check if each post is liked
    else: 
        user = None
        logged = False

    response = {
        "posts": [post.serialize(user=user) for post in showPosts],
        "totalpages": p.num_pages,
        "logged": logged
    }
    return JsonResponse(response, safe=False)


def profileposts(request, username):                        # Load profile posts
    user = get_object_or_404(User, username = username)
    posts = Post.objects.filter(user=user).order_by('-id')
    p = Paginator(posts, 10)
    page = request.GET.get("page")
    showPosts = p.get_page(page)
    if request.user.is_authenticated:
        response = {
            "posts": [post.serialize(user=request.user.id) for post in showPosts],
            "totalpages": p.num_pages,
            "logged": True
        }
    else:
        response = {
        "posts": [post.serialize() for post in showPosts],
        "totalpages": p.num_pages,
        "logged": False
        }
    return JsonResponse(response, safe=False)


def user(request, username = None):                              # Load profile info
    if username != None:
        user = get_object_or_404(User, username = username)
        data = user.serialize(user = request.user)
        data["loggeado"] = False
        if request.user.is_authenticated:
            data["loggeado"] = True
        return JsonResponse(data=data, safe=False)
    else:
        data = request.user.serialize()
        return JsonResponse(data=data, safe=False)

    
@login_required
def follow(request, username):

    if request.method == "PUT":

        user = get_object_or_404(User, username = username)

        if request.user in user.followers.all():

            user.followers.remove(request.user)

            user.save()

            return HttpResponseRedirect(reverse("profile", args=[username]))
        else:

            user.followers.add(request.user)

            user.save()
            return HttpResponseRedirect(reverse("profile", args=[username]))


@login_required
def following(request):

    following = request.user.following.all()
    posts = Post.objects.filter(user__in=following).order_by("-id")
    p = Paginator(posts, 10)
    page = request.GET.get("page")
    showPosts = p.get_page(page)
    response = {
        "posts" : [post.serialize(user = request.user) for post in showPosts],
        "totalpages" : p.num_pages
    }
    return JsonResponse(response, safe=False)


@login_required
def edit(request):
    if request.method == "PUT":
        try:            
            
            data = json.loads(request.body)
            contenido = data.get("content","")
            id = data.get("id","")
            post = Post.objects.get(pk=id)
            post.content = contenido
            post.edited = True
            post.save()

            return JsonResponse({"message": "Post editado exitosamente"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        

