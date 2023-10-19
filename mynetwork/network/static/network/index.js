var currentPage = 1;
var currentTemplate = "index"
var currentTotalPages = 1;
var currentProfile = "";


// Start when DOM Content is loaded
document.addEventListener("DOMContentLoaded", function() {

    index()


    document.querySelector("#pagetitle").addEventListener("click", () => {
        currentTemplate = "index"
        index()
    });


    const followingPage = document.querySelector("#followingLink");
    const userLink = document.querySelector("#usernameNav");
    if (followingPage && userLink) {
        followingPage.addEventListener("click", () => {
            currentTemplate = "following"
            following()

        })
        userLink.addEventListener("click", () => {
            currentTemplate = "profile"
            profile(username = userLink.innerHTML)
        })
    };


    
    document.querySelectorAll(".prevPage").forEach((element) => {
        element.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage -= 1;
            document.querySelector("#posts").innerHTML = "";
            if (currentTemplate === "index") {
                loadyells(username = null, page=currentPage);
            } else if (currentTemplate === "following") {
                following(user = currentProfile, page = currentPage)
            } else if (currentTemplate === "profile") {
                profile(username = currentProfile, page = currentPage)
            }
        } else {
        }
    })
    })
    
    document.querySelectorAll(".nextPage").forEach((element) => {
        element.addEventListener("click", () => {

        if (currentTotalPages !== currentPage) {
            currentPage += 1
            document.querySelector("#posts").innerHTML = "";
            if (currentTemplate === "index") {
                loadyells(username = null, page=currentPage);
            } else if (currentTemplate === "following") {
                following(page = currentPage)
            } else if (currentTemplate === "profile") {
                profile(username = currentProfile, page = currentPage)
            }
        } else {
        }
    })
    })
    
})


function yell() {                                           // Yell button function

    content = document.querySelector("#sent-text").value;
    if (content === "") {
        
    } else {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        fetch("/yell", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({
                content: content
            })
        })
        .then(response => response.json()) // Parsear la respuesta como JSON
        .then(data => {
        post(data)
        })
        .catch(error => {
        console.error("Error al recibir la respuesta:", error);
        });
        index()
    }
    
}


function index() {                                      // LOAD INDEX PAGE

    currentTemplate = "index"

    document.querySelector("#posts").innerHTML = "";
    document.querySelector(".profilepage").style.display = "none";
    document.querySelector("#followingpage").style.display = "none";
    document.querySelector("#indexpage").style.display = "block";
    

    currentPage = 1;

    loadyells();

    // Yell button listener
    const yellbox = document.querySelector("#post-yell");
    yellbox.addEventListener("click", yell);
    document.querySelector("textarea").value = "";  
}

function profile(username = undefined, page = 1) {                                    // Loads profile

    currentTemplate = "profile"

    document.querySelector("#posts").innerHTML = "";
    document.querySelector(".profilepage").style.display = "block";
    document.querySelector("#followingpage").style.display = "none";
    document.querySelector("#indexpage").style.display = "none";
    const mesa = document.querySelector("#mesa");
    if (mesa) {
        mesa.style.display = "none";
    }
    currentPage = page


    fetch(`/user/${username}`)
    .then(response => response.json())
    .then(user => {
        document.querySelector("#userprofile").innerHTML = user.username
        document.querySelector("#followingCount").innerHTML = user.following
        document.querySelector("#postsCount").innerHTML = user.posts
        const followersCount = document.querySelector("#followersCount");
        followersCount.innerHTML = user.followers
        if (user.sameUser === false && user.loggeado) {
            const followButton = document.querySelector("#follow");
            followButton.style.display = "inline-block";
            const mesa = document.querySelector("#mesa");
            mesa.style.display = "inline-block";
            document.querySelector("#follow").innerHTML = user.isfollowing ? "Decirle que se abra" : "Invitar a tu mesa";
            if (user.isfollowing) {
                followButton.classList.add("unfollow")
            }
            followButton.addEventListener("click", () => {
                let currentFollowers =  parseInt(followersCount.textContent);
                followButton.classList.toggle("unfollow");
                followersCount.innerHTML = document.querySelector("#follow").innerHTML.trim() === "Invitar a tu mesa" ? currentFollowers + 1 : currentFollowers - 1;
                document.querySelector("#follow").innerHTML = document.querySelector("#follow").innerHTML === "Invitar a tu mesa" ? "Decirle que se abra" : "Invitar a tu mesa";
                follow(username)
            })
        } else {
            document.querySelector("#follow").style.display = "none";
        }
        
        loadyells(user = user.username, page = currentPage)
    })
}


function follow(username){                          // FUNCTION TO FOLLOW A USER
    fetch(`/follow/${username}`, {
        method: "PUT",
        headers: {
            "X-CSRFToken": csrfToken
        }
    });
}
