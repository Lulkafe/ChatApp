const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const server = http.createServer(app);
const frontEndOrigin = ['http://localhost:5500', 'http://127.0.0.1:5500'];
const io = require('socket.io')(server, {
    cors: {
        origin: frontEndOrigin,
        methods: ['GET']
    }
});

import { Request, Response } from 'express';
import { ChatRoomHandler } from './chatRoomHandler';
import { MessageFrame, ChatRoom } from './interface';
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
            const newRoom: ChatRoom = roomHandler.createNewRoom();
            res.json(newRoom);
        } catch (e) {
            console.error(e);
            res.json({ error: `Unexpected error happened` })
        }
    }
});

//Guest user inquires(posts to) the server if a room exists
//TODO: A chatroom obj should return
app.post('/api/room/check', (req: Request, res: Response) => {
    console.log('[POST] - /api/room/check');
    console.log(req.body);
    res.json({ text: 'Received your text'});
});

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('chat message', (msgFrame: MessageFrame) => {
        console.log(`[NEW MESSAGE] TO: ${msgFrame.roomId}`);
        if (msgFrame.roomId) {
            socket.join(msgFrame.roomId); //TODO: should move to 'enter room later'
            io.to(msgFrame.roomId).emit('chat message', msgFrame.message);
        }
        else
            io.emit('chat message', msgFrame.message);
    })

    socket.on('enter room', (roomId) => {
        socket.join(roomId);
    })

    socket.on('leave room', (roomId) => {
        socket.leave(roomId);
    })

    socket.on('disconnect', () => {
        console.log(`A user disconnected: ${socket.id}`);
    })
})

server.listen(3000, () => {
    console.log('Listening on port 3000');
})

module.exports = server;