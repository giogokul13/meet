const express = require('express');
const app = express(); 
const server = require('http').Server(app);
const { v4: uuidv4 } = require('uuid');
const io = require('socket.io')(server);
const {ExpressPeerServer} = require('peer');
const peerServer = ExpressPeerServer(server,{
    debug : true
});

app.use(express.static('public'));
app.use('/peerjs',peerServer);


app.set('view engine' , 'ejs');

app.get('/', (req , res) =>{
    res.redirect(`/${uuidv4()}`);

});

app.get('/:room', (req , res) =>{
    res.render('room' , {roomid : req.params.room });
});


io.on('connection',socket =>{
    socket.on('join-room',(roomid , userid)=>{
        console.log("joined room");
        socket.join(roomid);
        socket.to(roomid).broadcast.emit('user-connected', userid);

        socket.on('message' , message =>{
            io.to(roomid).emit('createmessage' , message);
        });
        socket.on('disconnect', () => {
            socket.to(roomid).broadcast.emit('user-disconnected', userid)
          })
    });
});


server.listen(process.env.PORT||3000,()=>{
    console.log("meeting started....")
});