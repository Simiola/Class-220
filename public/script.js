const socket = io("/");

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});

const user = prompt("Enter your name");
const myvideo= document.createElement("video")
myvideo.muted=true

var mystream

navigator.mediaDevices.getUserMedia({
    audio:true,
    video:true
})
.then((f)=>{
    console.log("what is f: ",f)
    mystream=f
    addVideoStream(myvideo,f)

    socket.on("user-connected",(userId)=>{
        connectToNewuser(userId,f)
    
    })

    peer.on("call",(call)=>{
        call.answer(f)
        const video=document.createElement("video")
        call.on("stream",(userVideoStream)=>{
            addVideoStream(video,userVideoStream)
        })
    })

})
function addVideoStream(v,s){
    v.srcObject=s
    v.addEventListener("loadedmetadata",()=>{
        v.play()
        $("#video_stream").append(v)
    })
}

function connectToNewuser(userId,stream){
    const call = peer.call(userId,stream)
    const v= document.createElement("video")

    call.on("stream", (userVideoStream)=>{
        addVideoStream(v,userVideoStream)
    })
}

$(function () {
    $("#show_chat").click(function () {
        $(".left-window").css("display", "none")
        $(".right-window").css("display", "block")
        $(".header_back").css("display", "block")
    })
    $(".header_back").click(function () {
        $(".left-window").css("display", "block")
        $(".right-window").css("display", "none")
        $(".header_back").css("display", "none")
    })


    $("#send").click(function () {
        if ($("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })

    $("#chat_message").keydown(function (e) {
        if (e.key == "Enter" && $("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })
    $("#mute_button").click(function(){
        const enabled= mystream.getAudioTracks()[0].enabled
        if (enabled){
            mystream.getAudioTracks()[0].enabled = false
            html = `<i class="fas fa-microphone-slash"></i>`
            $("#mute_button").toggleClass("background-red")
            $("#mute_button").html(html)
        
            
        }

        else{
            mystream.getAudioTracks()[0].enabled = true
            html = `<i class="fas fa-microphone"></i>`
            $("#mute_button").toggleClass("background-red")
            $("#mute_button").html(html)
        }

    })

    $("#stop_video").click(function(){
        const enabled= mystream.getVideoTracks()[0].enabled
        if (enabled){
            mystream.getVideoTracks()[0].enabled = false
            html = `<i class="fas fa-video-slash"></i>`
            $("#stop_video").toggleClass("background-red")
            $("#stop_video").html(html)
        
            
        }

        else{
            mystream.getVideoTracks()[0].enabled = true
            html = `<i class="fas fa-video"></i>`
            $("#stop_video").toggleClass("background-red")
            $("#stop_video").html(html)
        }

    })

})

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

socket.on("createMessage", (message, userName) => {
    $(".messages").append(`
        <div class="message">
            <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
        }</span> </b>
            <span>${message}</span>
        </div>
    `)
});