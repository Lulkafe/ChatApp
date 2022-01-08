const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const server = http.createServer(app);
const frontEndOrigin = 'http://127.0.0.1:5501';
const io = require('socket.io')(server, {
    cors: {
        origin: frontEndOrigin,
        methods: ['GET']
    }
});

import { Request, Response } from 'express';
import {ChatRoomHandler, chatRoom } from './chatRoomHandler';
const roomHandler = new ChatRoomHandler();

app.get('/api/roomID', (req: Request, res: Response) => {
    
    if (roomHandler.canCreateNewRoom()) {
        const newRoom: chatRoom = roomHandler.createNewRoom();
        res.json(newRoom);
    }

});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', (socket) => {
        console.log('A user disconnected');
    })
})

server.listen(3000, () => {
    console.log('Listening on port 3000');
})