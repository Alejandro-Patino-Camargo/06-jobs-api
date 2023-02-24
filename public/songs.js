async function buildsongTable(songTable, songTabelHeader, token, message) {
    try {
        const response = await fetch("/api/v1/songs", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
        var children = [songTabelHeader];
        if (response.status === 200) {
            if (data.count === 0) {
                songTable.replaceChildren(...children); // clear this for safety
                return 0;
            } else {
                for (let i = 0; i < data.songs.length; i++) {
                    let editButton = `<td><button type="button" class="editButton" data-id=${data.songs[i]._id}>edit</button></td>`;
                    let deleteButton = `<td><button type="button" class="deleteButton" data-id=${data.songs[i]._id}>delete</button></td>`;
                    let rowHTML = `<td>${data.songs[i].artist}</td><td>${data.songs[i].song}</td><td>${data.songs[i].genre}</td>${editButton}${deleteButton}`;
                    let rowEntry = document.createElement("tr");
                    rowEntry.innerHTML = rowHTML;
                    children.push(rowEntry);
                }
                songTable.replaceChildren(...children);
            }
            return data.count;
        } else {
            message.textContent = data.msg;
            return 0;
        }
    } catch (err) {
        message.textContent = "A communication error occurred.";
        return 0;
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const logoff = document.getElementById("logoff");
    const message = document.getElementById("message");
    const logonRegister = document.getElementById("logon-register");
    const logon = document.getElementById("logon");
    const register = document.getElementById("register");
    const logonDiv = document.getElementById("logon-div");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const logonButton = document.getElementById("logon-button");
    const logonCancel = document.getElementById("logon-cancel");
    const registerDiv = document.getElementById("register-div");
    const name = document.getElementById("name");
    const email1 = document.getElementById("email1");
    const password1 = document.getElementById("password1");
    const password2 = document.getElementById("password2");
    const registerButton = document.getElementById("register-button");
    const registerCancel = document.getElementById("register-cancel");
    const songs = document.getElementById("songs");
    const songTable = document.getElementById("song-table");
    const songTabelHeader = document.getElementById("song-table-header");
    const addSong = document.getElementById("add-song");
    const editSong = document.getElementById("edit-song");
    const artist = document.getElementById("artist");
    const song = document.getElementById("song");
    const genre = document.getElementById("genre");
    const addingSong = document.getElementById("adding-songs");
    const songsMessage = document.getElementById("song-Message");
    const editCancel = document.getElementById("edit-cancel");

    // section 2 

    let showing = logonRegister;
    let token = null;
    document.addEventListener("startDisplay", async () => {
        showing = logonRegister;
        token = localStorage.getItem("token");
        if (token) {
            //if the user is logged in
            logoff.style.display = "block";
            const count = await buildsongTable(
                songTable,
                songTabelHeader,
                token,
                message
            );
            if (count > 0) {
                songsMessage.textContent = "";
                songTable.style.display = "block";
            } else {
                songsMessage.textContent = "There are no songs to display for this user.";
                songTable.style.display = "none";
            }
            songs.style.display = "block";
            showing = songs;
        } else {
            logonRegister.style.display = "block";
        }
    });

    var thisEvent = new Event("startDisplay");
    document.dispatchEvent(thisEvent);
    var suspendInput = false;

    // section 3


    document.addEventListener("click", async (e) => {
        if (suspendInput) {
            return; // we don't want to act on buttons while doing async operations
        }
        if (e.target.nodeName === "BUTTON") {
            message.textContent = "";
        }
        if (e.target === logoff) {
            localStorage.removeItem("token");
            token = null;
            showing.style.display = "none";
            logonRegister.style.display = "block";
            showing = logonRegister;
            songTable.replaceChildren(songTabelHeader); // don't want pending users to see
            message.textContent = "You are logged off.";
        } else if (e.target === logon) {
            showing.style.display = "none";
            logonDiv.style.display = "block";
            showing = logonDiv;
        } else if (e.target === register) {
            showing.style.display = "none";
            registerDiv.style.display = "block";
            showing = registerDiv;
        } else if (e.target === logonCancel || e.target == registerCancel) {
            showing.style.display = "none";
            logonRegister.style.display = "block";
            showing = logonRegister;
            email.value = "";
            password.value = "";
            name.value = "";
            email1.value = "";
            password1.value = "";
            password2.value = "";
        } else if (e.target === logonButton) {
            suspendInput = true;
            try {
                const response = await fetch("/api/v1/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.value,
                        password: password.value,
                    }),
                });
                const data = await response.json();
                if (response.status === 200) {
                    message.textContent = `Logon successful.  Welcome ${data.user.name}`;
                    token = data.token;
                    localStorage.setItem("token", token);
                    showing.style.display = "none";
                    thisEvent = new Event("startDisplay");
                    email.value = "";
                    password.value = "";
                    document.dispatchEvent(thisEvent);
                } else {
                    message.textContent = data.msg;
                }
            } catch (err) {
                message.textContent = "A communications error occurred.";
            }
            suspendInput = false;
        } else if (e.target === registerButton) {
            if (password1.value != password2.value) {
                message.textContent = "The passwords entered do not match.";
            } else {
                suspendInput = true;
                try {
                    const response = await fetch("/api/v1/auth/register", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name: name.value,
                            email: email1.value,
                            password: password1.value,
                        }),
                    });
                    const data = await response.json();
                    if (response.status === 201) {
                        message.textContent = `Registration successful.  Welcome ${data.user.name}`;
                        token = data.token;
                        localStorage.setItem("token", token);
                        showing.style.display = "none";
                        thisEvent = new Event("startDisplay");
                        document.dispatchEvent(thisEvent);
                        name.value = "";
                        email1.value = "";
                        password1.value = "";
                        password2.value = "";
                    } else {
                        message.textContent = data.msg;
                    }
                } catch (err) {
                    message.textContent = "A communications error occurred.";
                }
                suspendInput = false;
            }
        } // section 4
        else if (e.target === addSong) {
            showing.style.display = "none";
            editSong.style.display = "block";
            showing = editSong;
            delete editSong.dataset.id;
            artist.value = "";
            song.value = "";
            genre.value = "pending";
            addingSong.textContent = "add";
        } else if (e.target === editCancel) {
            showing.style.display = "none";
            artist.value = "";
            song.value = "";
            genre.value = "pending";
            thisEvent = new Event("startDisplay");
            document.dispatchEvent(thisEvent);
        } else if (e.target === addingSong) {
            if (!editSong.dataset.id) {
                // this is an attempted add
                suspendInput = true;
                try {
                    const response = await fetch("/api/v1/songs", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            artist: artist.value,
                            song: song.value,
                            genre: genre.value,
                        }),
                    });
                    const data = await response.json();
                    if (response.status === 201) {
                        //successful create
                        message.textContent = "The song entry was created.";
                        showing.style.display = "none";
                        thisEvent = new Event("startDisplay");
                        document.dispatchEvent(thisEvent);
                        artist.value = "";
                        song.value = "";
                        genre.value = "other";
                    } else {
                        // failure
                        message.textContent = data.msg;
                    }
                } catch (err) {
                    message.textContent = "A communication error occurred.";
                }
                suspendInput = false;
            } else {
                // this is an update
                suspendInput = true;
                try {
                    const songID = editSong.dataset.id;
                    const response = await fetch(`/api/v1/songs/${songID}`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            artist: artist.value,
                            song: song.value,
                            genre: genre.value,
                        }),
                    });
                    const data = await response.json();
                    if (response.status === 200) {
                        message.textContent = "The entry was updated.";
                        showing.style.display = "none";
                        artist.value = "";
                        song.value = "";
                        genre.value = "pending";
                        thisEvent = new Event("startDisplay");
                        document.dispatchEvent(thisEvent);
                    } else {
                        message.textContent = data.msg;
                    }
                } catch (err) {

                    message.textContent = "A communication error occurred.";
                }
            }
            suspendInput = false;
        } // section 5
        else if (e.target.classList.contains("editButton")) {
            editSong.dataset.id = e.target.dataset.id;
            suspendInput = true;
            try {
                const response = await fetch(`/api/v1/songs/${e.target.dataset.id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.status === 200) {
                    artist.value = data.song.artist;
                    song.value = data.song.song;
                    genre.value = data.song.genre;
                    showing.style.display = "none";
                    showing = editSong;
                    showing.style.display = "block";
                    addingSong.textContent = "update";
                    message.textContent = "";
                } else {
                    // might happen if the list has been updated since last display
                    message.textContent = "The songs entry was not found";
                    thisEvent = new Event("startDisplay");
                    document.dispatchEvent(thisEvent);
                }
            } catch (err) {
                message.textContent = "A communications error has occurred.";
            }
            suspendInput = false;
        }   // section 6

        // TODO: add code to handle delete button

        else if (e.target.classList.contains("deleteButton")) {
            editSong.dataset.id = e.target.dataset.id;
            suspendInput = true;
            try {
                const response = await fetch(`/api/v1/songs/${e.target.dataset.id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.status === 200) {
                    message.textContent = "The entry was deleted.";
                    artist.value = data.song.artist;
                    song.value = data.song.song;
                    genre.value = data.song.genre;
                    showing.style.display = "none";
                    showing = editSong;
                    showing.style.display = "block";
                    addingSong.textContent = "update";
                    message.textContent = "";
                } else {
                    // might happen if the list has been updated since last display
                    message.textContent = "The songs entry was not found";
                    thisEvent = new Event("startDisplay");
                    document.dispatchEvent(thisEvent);
                }
            } catch (err) {
                message.textContent = "A communications error has occurred.";
            }
            suspendInput = false;
        }   // section 8 after this line

    })
});





