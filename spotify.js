let current_song = new Audio();
let songs;
function formatTime(seconds) {
    if(isNaN(seconds) || seconds < 0){
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs() {
    let a = await fetch(
        "http://192.168.18.61:3000/Spotify-clone/assets/songs/"
    );
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".m4a")) {
            songs.push(element.href);
        }
    }
    return songs;
}

const playmusic = (track, artist) => {
    current_song.src =
        "/Spotify-clone/assets/songs/" + track + "-" + artist + ".m4a";
    current_song.play();
    const playbutton = document.getElementById("play-pause");
    playbutton.src = "assets/SVG/pause.svg";
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function main() {
    // get list of all song
    songs = await getsongs();
    let songul = document.querySelector(".songlibrary ul");

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

    // event listener in all songs
    Array.from(
        document.querySelector(".songlibrary").getElementsByTagName("li")
    ).forEach((e) => {
        e.addEventListener("click", (element) => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML;
            let songArtist = e.querySelector("#song-artist").innerHTML;
            playmusic(songName, songArtist);
        });
    });

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

    // add an event listner for hamburder
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-110%"
    })

    // add an event listener to previous and next
    let previous_button = document.getElementById("previous-song");
    previous_button.addEventListener("click", () => {
        let index = songs.indexOf(current_song.src);
        let previousindex = (index - 1);
        if (previousindex >= 0){
            let previoussongul = songs[previousindex];
            let decoded = decodeURIComponent(previoussongul);
            let raw_song = decoded.split("/").pop();
            let [songName, songArtist] = raw_song.replace(".m4a", "").split("-");
            playmusic(songName, songArtist);
        }
    });
    
    let next_button = document.getElementById("next-song");
    next_button.addEventListener("click", () => {
        let index = songs.indexOf(current_song.src);
        let nextindex = index + 1;
        if (nextindex < songs.length){
            let nextsongul = songs[nextindex];
            let decoded = decodeURIComponent(nextsongul);
            let raw_song = decoded.split("/").pop();
            let [songName, songArtist] = raw_song.replace(".m4a", "").split("-");
            playmusic(songName, songArtist);
        }
    });

    // add an event to volume
    document.querySelector("#volume-range").addEventListener("change", (e) => {
        console.log("setting volume to",e.target.value, "/100")
        current_song.volume = parseInt(e.target.value)/100
    });
    

}
main();
