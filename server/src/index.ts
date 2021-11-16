const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
import { Request, Response } from 'express';
import * as db from './chatRoomHandler';


app.get('/chat/new/roomID', (req: Request, res: Response) => {
    res.send('<h1>Hello</h1>');
    /*
      generate room ID(s)
    */
});

server.listen(3000, () => {
    console.log('Hello, Client!');
})