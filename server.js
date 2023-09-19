const path=require('path');
const express=require('express');
const http=require('http');
const socketio=require('socket.io'); 
const formatMessage=require('./utilis/messages');   
const {userJoin,getCurrentUser,userLeave,getRoomUsers} =require('./utilis/users');

const app=express();

const server=http.createServer(app);
const io=socketio(server);
const botName='ChatCord Bot';
//Set static folder
app.use(express.static(path.join(__dirname,'public')));

//Run when clients connects
io.on('connection',(socket)=>{
    
    socket.on('joinRoom',({username,room})=>{
        const user=userJoin(socket.id,username,room);

        socket.join(user.room);
        
    //Welcome the current user
    socket.emit('message',formatMessage(botName,'Welcome to chatCord')); 


    //Broadcast when user connects
    socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${username} has Joined the chat`));

    //send users and room info
    io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)
    });

    });


    //Runs when client disconnect
    socket.on('disconnect',()=>{
        const user=userLeave(socket.id);
        io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
           //send users and room info
        io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)
    });
    });

    //Listen For Chat Messages

    socket.on('chatMessage',(msg)=>{
        const user=getCurrentUser(socket.id)
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });

});

const PORT=3000 || process.env.PORT;     

server.listen(PORT,()=>console.log(`Server running on PORT ${PORT}`));