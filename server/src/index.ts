if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

import { Request, Response } from 'express';
import { ChatRoomHandler } from './chatRoomHandler';
import { MessageFrame, ChatRoomInfo } from './interface';
import { defaultIdLength } from './IdGenerator';

const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const server = http.createServer(app);
const allowed_origin = process.env.ALLOWED_ORIGIN?.split(',');

const io = require('socket.io')(server, {
    cors: {
        origin: allowed_origin,
        methods: ['GET']
    }
});
const roomHandler = new ChatRoomHandler();
const PORT = process.env.PORT || 3000;

console.log(`PORT: ${PORT}`);
console.log(`ORIGIN: ${allowed_origin}`);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet());
app.use(cors({
    origin: allowed_origin,
    methods: ['GET', 'POST']
}));


//User requests a room ID to server
app.get('/api/room/new', (req: Request, res: Response) => {
    
    if (roomHandler.canCreateNewRoom()) {
        try {
            const newRoom: ChatRoomInfo = roomHandler.createNewRoom();
            res.json(newRoom);
        } catch (e) {
            console.error(e);
            res.json({ error: 'Server internal error happened' })
        }
    } else {
        res.json({ error: 'All rooms are full. Try later..'})
    }
});


app.post('/api/room/size', (req: Request, res: Response) => {
    const { roomId } = req.body;
    let roomSize = null;

    if (roomHandler.doesThisRoomExist(roomId)) {
        roomSize = io.sockets.adapter.rooms.get(roomId).size
        res.json({ size: roomSize });
    } else {
        res.json({ error: 'No such room exists'})
    }

})

app.post('/api/room/check', (req: Request, res: Response) => {
    let { roomId } = req.body;

    if (typeof roomId !== 'string' || roomId.length > defaultIdLength)
        return res.json({ error: 'Invalid Room ID' });

    roomId = roomId.trim().toUpperCase();

    if (roomHandler.doesThisRoomExist(roomId)) 
        return res.json({ room: roomHandler.fetchRoomInfo(roomId) });

    res.json({ error: 'Room Not found'});
}); 

io.on('connection', (socket) => {

    socket.on('chat message', (msgFrame: MessageFrame) => {
        const maxChatMsgLength = 500;
        const maxUserNameLength = 30;

        //For security purpose.
        //The following two check are not executed under a normal situation
        //because of maxlength at the front end side
        if (msgFrame.message.text.length > maxChatMsgLength)
            msgFrame.message.text = msgFrame.message.text.substring(0, maxChatMsgLength);

        if (msgFrame.message.userName.length > maxChatMsgLength)
            msgFrame.message.userName = msgFrame.message.userName.substring(0, maxUserNameLength);

        if (msgFrame.roomId) 
            socket.to(msgFrame.roomId).emit('chat message', msgFrame.message);
  
    })

    socket.on('enter room', (roomId) => {
        socket.join(roomId);
        io.to(roomId).emit('update participant', roomId);
    })

    socket.on('leave room', (roomId) => {
        socket.leave(roomId);
        io.to(roomId).emit('update participant', roomId);
    })

    socket.on('disconnecting', () => {
        //First element of the array is user ID, not room ID.
        const joinedRooms = Array.from(socket.rooms).slice(1);
        for (const joinedRoom of joinedRooms) 
            io.to(joinedRoom).emit('update participant', joinedRoom);
    })

    socket.on('disconnect', () => {
        //User disconnected
    })
})

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})

module.exports = server;