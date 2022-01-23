import React, { useContext } from 'react'
import { MessageFrame } from '../interface';
import { AppContext } from '../context'

const ChatMessageInput = () => {

    const { state } = useContext(AppContext); 
    const { socket } = state; 
    const onSubmit = (e) => {
        e.preventDefault();
        const inputElem = document.getElementById('input');
        const text: string = (inputElem as HTMLInputElement).value;
        const msgFrame:MessageFrame = {
            message: {
                text,
                userName: '',
                commentedOn: new Date().toISOString()
            },
            roomId: state.currentRoom.id
        }
   
        if (text && socket) {
            socket.emit('chat message', msgFrame);
        }
        
        (inputElem as HTMLInputElement).value = '';
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