let current_song = new Audio();
let current_folder;
let songs; // Declare songs as a global variable

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    current_folder = folder;
    let a = await fetch(
        `http://192.168.18.61:3000/Spotify-clone/assets/songs/${folder}/`
    );
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".m4a")) {
            songs.push(element.href);
        }
    }

    let songul = document.querySelector(".songlibrary ul");
    songul.innerHTML = "";
    for (const song of songs) {
        let decoded = decodeURIComponent(song);
        let raw_song = decoded.split("/").pop();
        let real_song_name = raw_song.replace(".m4a", "");
        let [song_name, song_artist] = real_song_name.split("-");
        songul.innerHTML += `<li>
                            <img src="assets/SVG/musiclogo.svg" alt="musiclogo">
                            <div class="info">
                                <div id="song-name">${song_name}</div>
                                <div id="song-artist">${song_artist}</div>
                            </div>
                            <div class="playnow">
                                <img width="25" src="assets/SVG/playbutton.svg" alt="">
                            </div>
                            </li>`;
    }

    SetupEventListeners(); // No need to pass songs as argument
}

const playmusic = (url) => {
    current_song.src = url;
    current_song.play();
    document.getElementById("play-pause").src = "assets/SVG/pause.svg";
    let decoded = decodeURIComponent(url.split("/").pop());
    let real_song_name = decoded.replace(".m4a", "");
    let [song_name, song_artist] = real_song_name.split("-");
    document.querySelector(".songinfo").innerHTML = song_name;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(
        `/Spotify-clone/assets/songs/`
    );
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const element = array[index];

        if (element.href.includes("/songs/")) {
            let folder_name = element.href.split("/").slice(-2)[0];
            // get the meta data of the folder
            let a = await fetch(
                `/Spotify-clone/assets/songs/${folder_name}/info.json`
            );
            let response = await a.json();
            cardcontainer.innerHTML += `
                <div data-folder="${folder_name}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" width="50px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 512"><circle fill="#1fdf64" cx="256" cy="256" r="256"/><path fill="#1fdf64" d="M256 9.28c136.12 0 246.46 110.35 246.46 246.46 0 3.22-.08 6.42-.21 9.62C497.2 133.7 388.89 28.51 256 28.51S14.8 133.7 9.75 265.36c-.13-3.2-.21-6.4-.21-9.62C9.54 119.63 119.88 9.28 256 9.28z"/><path fill="#000" d="M351.74 275.46c17.09-11.03 17.04-23.32 0-33.09l-133.52-97.7c-13.92-8.73-28.44-3.6-28.05 14.57l.54 191.94c1.2 19.71 12.44 25.12 29.04 16l131.99-91.72z"/></svg> 
                    </div>                
                    <img width="200px" src="assets/songs/${folder_name}/cover.jpg" alt="new-music-friday"> 
                    <p>${response.title}</p>
                    <p>${response.description}</p>
                </div>`;
        } 
    }
    // load the playlist when a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {
            await getsongs(`${item.currentTarget.dataset.folder}`);
        });
    });
}



async function main() {
    await getsongs("cigarettes");

    // display all the albums on the page
    displayAlbums();

    // attach an event listener to play,pause,next and previous
    const playbutton = document.getElementById("play-pause");
    playbutton.addEventListener("click", () => {
        if (current_song.paused) {
            current_song.play();
            playbutton.src = "assets/SVG/pause.svg";
        } else {
            current_song.pause();
            playbutton.src = "assets/SVG/playbutton.svg";
        }
    });

    // Update the position of the seek bar circle and play the song from the clicked position
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seekbarWidth = document.querySelector(".seekbar").clientWidth;
        const clickX = e.offsetX;
        const percentage = clickX / seekbarWidth;
        current_song.currentTime = current_song.duration * percentage;
    });

    // Listen for the timeupdate event to update the seek bar circle position
    current_song.addEventListener("timeupdate", () => {
        const percentage =
            (current_song.currentTime / current_song.duration) * 100;
        document.querySelector(".circle").style.left = `${percentage}%`;

        // Update the displayed time
        document.querySelector(".songtime").innerHTML = `
        ${formatTime(current_song.currentTime)} / ${formatTime(
            current_song.duration
        )}`;
    });

    // add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    // add an event listener to previous and next
    let previous_button = document.getElementById("previous-song");
    previous_button.addEventListener("click", () => {
        let index = songs.indexOf(current_song.src);
        let previousindex = index - 1;
        if (previousindex >= 0) {
            playmusic(songs[previousindex]);
        }
    });

    let next_button = document.getElementById("next-song");
    next_button.addEventListener("click", () => {
        let index = songs.indexOf(current_song.src);
        let nextindex = index + 1;
        if (nextindex < songs.length) {
            playmusic(songs[nextindex]);
        }
    });

    // add an event to volume
    document.querySelector("#volume-range").addEventListener("change", (e) => {
        current_song.volume = parseInt(e.target.value) / 100;
    });

    //add an event listener to mute the volume
    document.querySelector(".volume img").addEventListener("click", e => {
        const imgSrc = e.target.src;
        if (imgSrc.includes("volume.svg")) {
            e.target.src = imgSrc.replace("volume.svg", "mute.svg");
            current_song.volume = 0;
        } else {
            e.target.src = imgSrc.replace("mute.svg", "volume.svg");
            current_song.volume = 0.1;
        }
    });
    

}

function SetupEventListeners() {
    Array.from(document.querySelector(".songlibrary ul").children).forEach(
        (li, idx) => {
            li.addEventListener("click", () => {
                playmusic(songs[idx]);
            });
        }
    );
}

main();
