
let current_song = new Audio();
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

const playmusic =(track,artist)=>{
    // let audio = new Audio("/Spotify-clone/assets/songs/" + track + "-" + artist + ".m4a")
    current_song.src = "/Spotify-clone/assets/songs/" + track + "-" + artist + ".m4a"
    current_song.play()
}

async function main() {
    // get list of all song
    let songs = await getsongs();
    console.log(songs);

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
    Array.from(document.querySelector(".songlibrary").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML;
            let songArtist = e.querySelector("#song-artist").innerHTML;
            playmusic(songName, songArtist);
        });
    });

}
main();
