import React, { useContext } from 'react'
import { MessageFrame } from '../interface';
import { AppContext } from '../context'

const ChatRoomPage = () => {
    return (
        <div>

        </div>
    )
}

const StatusBar = (props) => {

    const { roomId, participants, remainingTime } = props; 

    return (
        <div>
            <span></span>
            <span>{participants}</span>
            <span>Closed in { remainingTime }</span>
        </div>
    )
}


const ChatMsgContainer = () => {

    //TODO: Add a feature to align speech balloons to left or right

    return (
        <div>

        </div>
    )
}

const SpeechBalloon = (props) => {

    const { userName, message } = props;

    return (
        <div>
            { userName && <h6>{userName}:</h6>}
            <p>{message}</p>
        </div>
    )
}

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
                <input type='text' placeholder='Name (optional)' /> 
                <br />
                <input type='text' placeholder="Message" id='input'/>
                <button type='submit' >Submit</button>
            </form>
        </div>
    )
}