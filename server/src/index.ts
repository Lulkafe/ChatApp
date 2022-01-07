const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server (server);

import { Request, Response } from 'express';
import {ChatRoomHandler, chatRoom } from './chatRoomHandler';
const roomHandler = new ChatRoomHandler();


app.get('/', (req: Request, res: Response) => {
    res.sendFile('../../client/dist/index.html');
})

app.get('/chat/new/roomID', (req: Request, res: Response) => {
    
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