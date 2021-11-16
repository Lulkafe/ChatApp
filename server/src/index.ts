const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
import generateRoomID from './roomIDGenerator';
import { Request, Response } from 'express';
import * as db from './db-driver';


try {
    (async () => { await db.connect(); })();
    console.log('Connected to DB');
} catch (e: unknown) {
    if (e instanceof Error) {
        console.error(e.message);
        throw e;
    }
}

app.get('/chat/new/roomID', (req: Request, res: Response) => {
    res.send('<h1>Hello</h1>');
    /*
      generate room ID(s)
      ask the db if this is unique
    */
});

server.listen(3000, () => {
    console.log('Hello, Client!');
})