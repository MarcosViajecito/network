function like(post_id) {                                        // Function to like posts
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    fetch(`/like/${post_id}`, {
        method: "POST", 
        headers: {
            "X-CSRFToken": csrfToken
        }
    });
}



function loadyells(username = null, page = 1) {                           // Function to fetch posts
    if (username === null ) {
        // LOAD INDEX PAGE
        fetch(`/loadyells/?page=${page}`)
        .then(response => response.json())
        .then(data => {
            const yells = data.posts;
            const totalPages = data.totalpages
            const logged = data.logged
            yells.forEach(yell => {
                post(yell, logged)
            })
            document.querySelectorAll(".totalpages").forEach((element) => {
                element.innerHTML = `${page} of ${totalPages}`
            });
            currentTotalPages = totalPages
        });
    } else {
        // LOAD PROFILE POSTS
        fetch(`/profileposts/${username}/?page=${page}`)
        .then(response => response.json())
        .then(data => {
            const yells = data.posts;
            const totalPages = data.totalpages;
            const logged = data.logged;
            yells.forEach(yell => {
                post(yell, logged)
            })
            document.querySelectorAll(".totalpages").forEach((element) => {
                element.innerHTML = `${page} of ${totalPages}`
            });
            currentTotalPages = totalPages
        });
    }
}


function post(yell, logged) {                                           // FUNCTION POST

    // CREATE CARD
    const element = document.createElement("div");
    element.setAttribute("data-id", yell.id)
    element.classList.add("card", "post");

    // CARD HEADER

    const head = document.createElement("div");
    head.classList.add("card-header")
    element.appendChild(head)

    // CALCULATE TIME AGO
    const currentTime = Math.floor(Date.now() / 1000); 
    const timeDifference = currentTime - yell.numerictime; 
    let timeAgo = calculateTime(timeDifference);
    const timestamp = document.createElement("span");
    timestamp.classList.add("timeAgo");
    timestamp.innerHTML = timeAgo
    head.appendChild(timestamp)

    // CREATE CLICKEABLE USER
    const usertag = document.createElement("span");
    usertag.classList.add("usertag")
    usertag.innerHTML = yell.user;
    usertag.addEventListener("click", function() {
        profile(user = yell.user)
        currentProfile = yell.user;
    })
    head.appendChild(usertag)



    // CARD BODY
    const body = document.createElement("div");
    body.classList.add("card-body");
    element.appendChild(body)

    //  CREATE LIKE BUTTON
    if (logged === true) {
        const cafeCounter = document.createElement("div");
        body.appendChild(cafeCounter)
        const likebutton = document.createElement("button");
        likebutton.classList.add("like", "btn");
        if (yell.liked === true) {
            likebutton.classList.add("liked");
        }
        likebutton.addEventListener("click", () => {
            like(yell.id)
            const likeCountSpan = element.querySelector(".likecount");
            const currentLikes = parseInt(likeCountSpan.textContent);
            likebutton.classList.toggle("liked")
            if (likebutton.classList.contains("liked")) {
                likeCountSpan.textContent = currentLikes + 1;
            } else {
                likeCountSpan.textContent = currentLikes - 1;
            }    });
        cafeCounter.appendChild(likebutton);
        
        const counter = document.createElement("span");
        counter.innerHTML = yell.likes
        counter.classList.add("likecount")
        cafeCounter.appendChild(counter)
    }

    // CREATE POST CONTENT SPAN
    const postContent = document.createElement("span")
    postContent.innerHTML = `
        <div class="postContent">${yell.content}</div>
    `;
    body.appendChild(postContent);

    // EDITED OR NOT
    if (yell.edited === true) {
        const edited = document.createElement("span");
        edited.classList.add("edited");
        edited.innerHTML = "Editado"
        body.appendChild(edited)
    }

    // EDIT BUTTON
    if (yell.editable === true) {
        createEditButton(element, head, body)
    }




    document.querySelector("#posts").append(element);
}



function calculateTime(timeDifference) {                // Function to calculate how long ago was the text posted
    if (timeDifference < 10) {
        timeAgo = ` a few seconds ago`;
    } else if (timeDifference < 60) {
        timeAgo = `${timeDifference.toFixed(0)} seconds ago`;
    } else if (timeDifference < 3600) {
        const minutes = Math.floor(timeDifference / 60);
        timeAgo = `${minutes.toFixed(0)} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (timeDifference < 86400) {
        const hours = Math.floor(timeDifference / 3600);
        timeAgo = `${hours.toFixed(0)} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
        const days = Math.floor(timeDifference / 86400);
        timeAgo = `${days.toFixed(0)} ${days === 1 ? 'day' : 'days'} ago`;
    }
    return timeAgo;
}

function following(page = 1){               ////// A TERMINARRRRRRRRRRR

    currentTemplate = "following"


    document.querySelector("#posts").innerHTML = "";
    document.querySelector("#followingpage").style.display = "block";
    document.querySelector(".profilepage").style.display = "none";
    document.querySelector("#indexpage").style.display = "none";

    fetch(`/following/?page=${page}`)
    .then(response => response.json())
    .then(data => {
        const yells = data.posts
        const totalPages = data.totalpages
        yells.forEach(yell => {
            post(yell)
        })
        currentTotalPages = totalPages
        document.querySelectorAll(".totalpages").forEach((element) => {
            element.innerHTML = `${page} of ${totalPages}`
        });
    });
}

function edit(element, head, body) {
    const content = body.querySelector(".postContent").innerHTML
    const saveButton = document.createElement("button");
    saveButton.classList.add("badge", "bg-primary", "saveButton");
    saveButton.innerHTML = "Save yell"
    saveButton.addEventListener("click", () => {
        savePost(element, head, body);
    })
    head.querySelector(".editar").remove();
    const elDiv = body.querySelector(".postContent");
    elDiv.innerHTML = ""
    const form = document.createElement("form");
    form.classList.add("editing")
    form.innerHTML = `<textarea class="form-control">${content}</textarea>`;
    head.appendChild(saveButton);
    elDiv.appendChild(form);
}

function savePost(element, head, body) {
    const texto = body.querySelector("textarea").value;
    if (texto !== "") {
        const id = element.getAttribute("data-id");

        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        fetch(`/edit`, {
            method: "PUT", 
            headers: {
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({
                content : texto, 
                id : id
            })
        });
        const removeButton = head.querySelector(".saveButton");
        removeButton.remove();
        const removeArea = body.querySelector("form");
        removeArea.remove();
        const elDiv = body.querySelector(".postContent");
        elDiv.innerHTML = texto;
        createEditButton(element, head, body);
        const edited = document.createElement("span");
        edited.classList.add("edited");
        edited.innerHTML = "Editado"
        body.appendChild(edited)    }
}

function createEditButton(element, head, body) {
    const editButton = document.createElement("button");
    editButton.innerHTML = "Editar";
    editButton.classList.add("badge", "bg-primary", "editar");
    editButton.addEventListener("click", function() {
        edit(element, head, body)
    });
    head.appendChild(editButton);
}