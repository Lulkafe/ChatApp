/** Chat room page **/

import React, { useContext, useEffect, useState } from 'react'
import { MessageFrame } from '../interface';
import { AppContext } from '../context'
import { Header, Timer } from '../components/common';

export const ChatRoomPage = () => {


    return (
        <div>
            <Header/>
            <StatusBar 
                roomId={'ABCDE'}
                participants={6}
                remainingTime={ {min: 50, sec: 0} }
                />
            <ChatMsgContainer/>
            <ChatMessageInput/>
        </div>
    )
}

const StatusBar = (props) => {

    const { roomId, participants, remainingTime } = props; 

    return (
        <div className='status-bar'>
            <div className='status-bar__content-wrapper'>
                <span className='status-bar__roomId'>&#128273;{roomId}</span>
                <span className='status-bar__participants'>&#129485;{participants}</span>
                <span className='status-bar__timer'>Deleted in <Timer /></span>
            </div>
        </div>
    )
}


const ChatMsgContainer = () => {

    const { state, dispatcher } = useContext(AppContext);
    
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

const RoomTimer = (props) => {
    const { min, sec } = props;
    const [second, setSecond] = useState(sec);
    const [minute, setMinute] = useState(min);
    const [intervalId, setIntervalId] = useState(0);
    const isTimeUp = () => second == 0 && minute == 0;

    useEffect(() => {

        if (!intervalId)
            setIntervalId(window.setInterval(() => {
                
                if (isTimeUp()) {
                    window.clearInterval(intervalId);
                    setIntervalId(0);
                    //TODO: dispatch DELETE event (?)
                } else if (second > 0) {
                    setSecond(second - 1);
                } else if (min > 0) {
                    setMinute(minute - 1);
                    setSecond(59);
                }
                    
            }, 1000))


    }, [intervalId, second, minute]);

    return (
        <div>
            
        </div>
    )
}