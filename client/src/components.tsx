import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const App = () => {

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        console.log('Inside UseEffect');
        let soc = io();
        setSocket(soc);

        soc.on('chat message', function(msg) {
           console.log('Received a message: ' + msg); 
        });


        console.log('socket variable should be set');
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();
        const inputElem = document.getElementById('input');
        const text = (inputElem as HTMLInputElement).value;
        if (text && socket) {
            console.log('Text and socket are both available. sending message...')
            socket.emit('chat message', text);
            (inputElem as HTMLInputElement).value = '';
        } else {
            console.log('text or socket is missing');
        }
    }

    return (
        <div>
            <div className='test__massage-field'>
                <ul className='test__message-list'>
                   <li>Text Message appears below</li> 
                </ul>
            </div>
            <form>
                <input type='text' placeholder="chat text" id='input'></input>
                <button type='submit' onSubmit={onSubmit}>Submit</button>
            </form>
        </div>
    )
}


//Test component to check functionality. Will be removed later
const Test = () => {

    const onSubmit = (e) => {
        e.preventDefault();
    }

    return (
        <div>
            <ul id='test__message-list'></ul>
            <form onSubmit={onSubmit}>
                <input type='text'></input>
                <button type='submit'></button>
            </form>
        </div>
    )
}