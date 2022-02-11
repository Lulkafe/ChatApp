/** Chat room page **/

import React, { useContext, useEffect, useState } from 'react'
import { MessageFrame } from '../interface';
import { AppContext } from '../context'
import { Header, Timer } from '../components/common';

export const ChatRoomPage = () => {


    return (
        <div className='chat-page__wrapper'>
            <Header/>
            <StatusBar 
                roomId={'ABCDE'}
                participants={6}
                remainingTime={ {min: 50, sec: 0} }
                />
            <ChatPageBody>
                <ChatMsgContainer/>
                <ChatMessageInput/>
            </ChatPageBody>
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

const ChatPageBody = (props) => {
    return (
        <div className='chat-page__body'>
            { props.children }
        </div>
    )
}


const ChatMsgContainer = () => {

    const { state, dispatcher } = useContext(AppContext);
    
    //TODO: Add a feature to align speech balloons to left or right
    return (
        <div className='chat-msg-container'>       
              <SpeechBalloon userName='John' message='Are you sure?'/>   
        </div>   
    )
}

const SpeechBalloon = (props) => {

    const { userName, message } = props;

    return (
        <div className='speech-balloon'>
            { userName && <p className='speech-balloon__username'>{userName}:</p>}
            <p className='speech-balloon__text'>{message}</p>
        </div>
    )
}

const ChatMessageInput = () => {

    const { state } = useContext(AppContext); 
    const { socket } = state; 
    const textFieldId = 'input';
    const nameFieldId = 'name'
    const onSubmit = (e) => {
        e.preventDefault();
        const inputElem = document.getElementById(textFieldId);
        const text: string = (inputElem as HTMLInputElement).value;

        const msgFrame: MessageFrame = {
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
        <form onSubmit={onSubmit}>
            <input type='text' placeholder='Name (optional)' 
                id={nameFieldId} className='input__user-name'/> 
            <br />
            <textarea placeholder="Message" 
                id={textFieldId} className='input__user-text'/>
            <div className='input__button-wrapper'>
                <button type='submit' className='input__submit-button'>Submit</button>
            </div>
        </form>
    )
}
