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
import {ChatRoomHandler, chatRoom } from './chatRoomHandler';
const roomHandler = new ChatRoomHandler();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
    origin: frontEndOrigin
}))

//User requests a room ID to server
app.get('/api/roomID', (req: Request, res: Response) => {
    
    console.log('[GET] - /api/roomID');
    /*
    if (roomHandler.canCreateNewRoom()) {
        const newRoom: chatRoom = roomHandler.createNewRoom();
        res.json(newRoom);
    }
    */

    res.json({ roomID: '#' });
});

//Guest user inquires(posts to) the server if a room exists
app.post('/api/roomID', (req: Request, res: Response) => {
    console.log('[POST] - /api/roomID');
    console.log(req.body);
    res.json({ text: 'Received your text'});
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (msg) => {
        console.log('Received a chat message');
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