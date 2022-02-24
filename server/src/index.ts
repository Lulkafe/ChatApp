const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const server = http.createServer(app);
const frontEndOrigin = ['http://localhost:5501', 'http://127.0.0.1:5501'];
const io = require('socket.io')(server, {
    cors: {
        origin: frontEndOrigin,
        methods: ['GET']
    }
});

import { Request, Response } from 'express';
import { ChatRoomHandler } from './chatRoomHandler';
import { MessageFrame, ChatRoomInfo } from './interface';
const roomHandler = new ChatRoomHandler();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
    origin: frontEndOrigin
}))


//User requests a room ID to server
app.get('/api/room/new', (req: Request, res: Response) => {
    console.log('[GET]: /api/room/new');
    
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
    console.log('[POST]: /api/room/size');
    const { roomId } = req.body;
    let roomSize = null;

    if (roomHandler.doesThisRoomExist(roomId)) {
        console.log(`Room ${roomId} exists`);
        roomSize = io.sockets.adapter.rooms.get(roomId).size
        res.json({ size: roomSize });
    } else {
        console.log(`Room ${roomId} does not exist`);
        res.json({ error: 'No such room exists'})
    }

})

app.post('/api/room/check', (req: Request, res: Response) => {
    console.log('[POST]: /api/room/check');
    const { roomId } = req.body;

    if (!roomId)
        return res.json({ error: 'Invalid Room ID' });

    if (roomHandler.doesThisRoomExist(roomId)) 
        return res.json({ room: roomHandler.fetchRoomInfo(roomId) });

    res.json({ error: 'Room Not found'});
});


io.on('connection', (socket) => {
    console.log(`[CONNECTION]: A user connected: ${socket.id}`);

    socket.on('chat message', (msgFrame: MessageFrame) => {
        console.log(`[NEW MESSAGE]: TO ${msgFrame.roomId}`);

        if (msgFrame.roomId) 
            socket.to(msgFrame.roomId).emit('chat message', msgFrame.message);
  
    })

    socket.on('enter room', (roomId) => {
        console.log(`[ENTER ROOM]: in ${roomId}`);
        socket.join(roomId);
        io.to(roomId).emit('update participant', roomId);
    })

    socket.on('leave room', (roomId) => {
        console.log(`[LEAVE ROOM]: in ${roomId}`);
        socket.leave(roomId);
        io.to(roomId).emit('update participant', roomId);
    })

    socket.on('disconnecting', () => {
        console.log('[DISCONNECTING]: A user is disconnecting...');

        //First element of the array is user ID, not room ID.
        const joinedRooms = Array.from(socket.rooms).slice(1);
        for (const joinedRoom of joinedRooms) 
            io.to(joinedRoom).emit('update participant', joinedRoom);
    })

    socket.on('disconnect', () => {
        console.log(`[DISCONNECT]: nA user disconnected: ${socket.id}`);
    })
})

server.listen(3000, () => {
    console.log('Listening on port 3000');
})

module.exports = server;