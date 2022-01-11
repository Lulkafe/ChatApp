import React, { useState, useEffect } from 'react';
import { useReducer } from 'react';
import { initState, Reducer, ACTION } from './reducer';
import { io } from 'socket.io-client';

export const App = () => {

    const [socket, setSocket] = useState(null);
    const [state, dispatch] = useReducer(Reducer, initState);

    useEffect(() => {
        console.log('Inside UseEffect');
        let soc = io('http://localhost:3000');
        setSocket(soc);

        soc.on('chat message', function(msg) {
           dispatch({ type: ACTION.UPDATE.MESSAGE, value: msg });
        });
    }, []);

    return (
        <div>
            <div className='test__massage-field'>
                <ul className='test__message-list'>
                   <li>Text Message appears below</li> 
                   { state.messages.map((message, i) => <li key={i}>{message}</li>)}
                </ul>
            </div>
            <MessageField socket={socket} />
        </div>
    )
}

const MessageField = (props) => {

    const { socket} = props;
  
    const onSubmit = (e) => {
        console.log('Submitted..');
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
            <form onSubmit={onSubmit}>
                <input type='text' placeholder="chat text" id='input'></input>
                <button type='submit' >Submit</button>
            </form>
        </div>
    )
}

const RoomIdField = () => {

    const [id, setId] = useState('');

    const onClick = async () => {
        //Return (success): id (string)
        //       (failure): null 

        //const response: Response = await fetch('http://localhost:3000/api/roomID');
        //const { roomId } = await response.json();
        const roomId = 'ABCDEF';

        if (roomId)
            setId(roomId);
    }

    return (
        <div>
            <input type='input' readOnly id='input__roomID' value={id}></input>
            <button type='button'>Reserve</button>
        </div>
    )
}
