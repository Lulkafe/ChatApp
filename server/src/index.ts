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

app.get('/', (req: Request, res: Response) => {
    res.sendStatus(200);
})

//User requests a room ID to server
//TODO: change 'roomID' to 'newRoom' 
app.get('/api/room/new', (req: Request, res: Response) => {
    
    console.log('[GET] - /api/room/new');
    
    if (roomHandler.canCreateNewRoom()) {
        try {
            const newRoom: ChatRoomInfo = roomHandler.createNewRoom();
            res.json(newRoom);
        } catch (e) {
            console.error(e);
            res.json({ error: `Unexpected error happened` })
        }
    }
});

app.post('/api/room/size', (req: Request, res: Response) => {
    console.log('[POST] - /api/room/size');
    const { roomId } = req.body;
    console.log(req.body);
    let roomSize = null;

    if (roomHandler.doesThisRoomExist(roomId)) {
        console.log(`Room ${roomId} exists`);
        roomSize = io.sockets.adapter.rooms.get(roomId).size
    } else
        console.log(`Room ${roomId} does not exist`);

    res.json({ size: roomSize });
})

app.post('/api/room/check', (req: Request, res: Response) => {
    console.log('[POST] - /api/room/check');
    const { roomId } = req.body;

    if (!roomId)
        return res.json({ error: 'Room Id not found or given properly' });

    if (roomHandler.doesThisRoomExist(roomId)) 
        return res.json({ room: roomHandler.fetchRoomInfo(roomId) });

    res.json({ error: 'Room Not found'});
});




io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('chat message', (msgFrame: MessageFrame) => {
        console.log(`[NEW MESSAGE] TO: ${msgFrame.roomId}`);
        if (msgFrame.roomId) {
            io.to(msgFrame.roomId).emit('chat message', msgFrame.message);
        }   1   
  
    })

    socket.on('enter room', (roomId) => {
        console.log(`[ENTER ROOM]: in ${roomId}`);
        socket.join(roomId);
        io.to(roomId).emit('update participant', roomId);
    })

    socket.on('leave room', (roomId) => {
        socket.leave(roomId);
        io.to(roomId).emit('update participant', roomId);
    })

    socket.on('disconnecting', () => {
        console.log('A user is disconnecting...');

        const joinedRooms = Array.from(socket.rooms).slice(1);
        for (const joinedRoom of joinedRooms) 
            io.to(joinedRoom).emit('update participant', joinedRoom);
    })

    socket.on('disconnect', () => {
        console.log(`A user disconnected: ${socket.id}`);
    })
})

server.listen(3000, () => {
    console.log('Listening on port 3000');
})

module.exports = server;