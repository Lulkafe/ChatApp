const mongoose = require("mongoose");
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
import { Request, Response } from 'express';
require('dotenv').config();

try {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

} catch (e: unknown) {
    if (e instanceof Error)
        console.error(e.message);
}


app.get('/chat/roomID', (req: Request, res: Response) => {
    res.send('<h1>Hello</h1>');
});

server.listen(3000, () => {
    console.log('Hello, Client!');
})