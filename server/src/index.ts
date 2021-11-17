const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
import { Request, Response } from 'express';
import {ChatRoomHandler, chatRoom } from './chatRoomHandler';
const roomHandler = new ChatRoomHandler();

app.get('/chat/new/roomID', (req: Request, res: Response) => {
    
    if (roomHandler.canCreateNewRoom()) {
        const newRoom: chatRoom = roomHandler.createNewRoom();
        res.json(newRoom);
    }

});

server.listen(3000, () => {
    console.log('Hello, Client!');
})