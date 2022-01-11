const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const server = http.createServer(app);
const frontEndOrigin = ['http://localhost:5501', 'http://127.0.0.1:5501'];
const io = require('socket.io')(server, {
    cors: {
        origin: frontEndOrigin,
        methods: ['GET']
    }
});

import { Request, Response } from 'express';
import {ChatRoomHandler, chatRoom } from './chatRoomHandler';
const roomHandler = new ChatRoomHandler();

//User requests a room ID to server
app.get('/api/roomID', (req: Request, res: Response) => {
    
    if (roomHandler.canCreateNewRoom()) {
        const newRoom: chatRoom = roomHandler.createNewRoom();
        res.json(newRoom);
    }

});

//Guest user inquires(posts to) the server if a room exists
app.post('/api/roomID', (req: Request, res: Response) => {
    
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (msg) => {
        console.log('Received a chat message. Emitting to users..');
        io.emit('chat message', msg);
    })

    socket.on('register room', () => {

    })

    socket.on('disconnect', (socket) => {
        console.log('A user disconnected');
    })
})

server.listen(3000, () => {
    console.log('Listening on port 3000');
})