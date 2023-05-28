const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

var nodemailer = require("nodemailer")

const transporter= nodemailer.createTransport({
    port:465,
    host:"smtp.gmail.com",
    auth:{
        user:"coder1234sim@gmail.com",
        pass:""
    },
    secure:true

})

app.post("/send-mail",(req,res)=>{
    const to = req.body.to
    const url= req.body.url

    const mailData={
        from:"coder1234sim@gmail.com",
        to:to,
        subject:"Join the chat with us",
        html:`<p> Hey there,</p>
        <p> come and join ,e for a video chat</>`
    }

    transporter.sendMail(mailData,(error,info)=>{
        if(error){
            return console.log(error)
        }
        res.status(200).send({
            message:"Inviation sent!!",
            message_id:info.messageId
        })
    })
})
    

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected", userId)
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(process.env.PORT || 3030);