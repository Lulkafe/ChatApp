/** Chat room page **/

import React, { useContext, useEffect, useState, useRef } from 'react'
import { ChatRoom, MessageFrame, Message } from '../interface';
import { AppContext } from '../context'
import { Header, Timer } from '../components/common';

export const ChatRoomPage = () => {
    return (
        <div className='chat-page__wrapper'>
            <Header/>
            <StatusBar/>
            <ChatPageBody>
                <ChatMsgContainer/>
                <ChatMessageInput/>
            </ChatPageBody>
        </div>
    )
}

const StatusBar = () => {
    const { state } = useContext(AppContext);
    const curRoom: ChatRoom = state.currentRoom;
    const roomId = curRoom.id;
    const participant = curRoom.participant;

    return (
        <div className='status-bar'>
            <div className='status-bar__content-wrapper'>
                <span className='status-bar__roomId'>&#128273; {roomId}</span>
                <span className='status-bar__participants'>&#129485;{participant}</span>
                <span className='status-bar__timer'>Deleted in <Timer 
                      startTime={new Date().toISOString()}
                      endTime={curRoom.expiredOn}/></span>
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
    const { currentRoom } : {currentRoom: ChatRoom } = state;
    const msgContainerRef = useRef(null);

    useEffect(() => {
        console.log('useEffect');
        console.log(msgContainerRef.current);
        msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight;
    }, [state.currentRoom.messages]);

    //TODO: Move to the buttom of the div when a new message comes
    return (
        <div className='chat-msg__container-shape'>  
            <div className='chat-msg__container' ref={msgContainerRef}>     
                { currentRoom.messages.map((message, i) => {
                    return (
                        <SpeechBalloon
                            key={`speech-balloon-${i}`} 
                            userName={message.userName}
                            message={message.text}
                            isMyComment={message.isMyComment}/>
                    )
                }) }  
            </div> 
        </div>   
    )
}

const SpeechBalloon = (props) => {
    const { userName, message, isMyComment } = props;

    return (
        <div className={'speech-balloon' + (isMyComment? ' speech-balloon--mine':'')}>
            { userName && <span className='speech-balloon__username'>{userName}:</span>}
            <p className='speech-balloon__text'>{message}</p>
        </div>
    )
}

const ChatMessageInput = () => {
    const { state, dispatcher } = useContext(AppContext); 
    const { socket, currentRoom } = state; 
    const [userName, setUserName] = useState('');
    const onSubmit = (e) => {
        e.preventDefault();
        const textArea = e.target.usertext;
        const nameInput = e.target.username;

        if (nameInput.value) 
            setUserName(nameInput.value);

        const message: Message = {
                text: textArea.value,
                userName : nameInput.value,
                commentedOn: new Date().toISOString(),
                isMyComment: true
            }

        const msgToOthers: MessageFrame = {
            message: {
                ...message,
                isMyComment: false
            },
            roomId: currentRoom.id
        }
        
        if (textArea.value && socket) {
            socket.emit('chat message', msgToOthers);
            dispatcher.addMessage(message);
        }

        textArea.value = ''
    }

    return (
        <form className='input__form' onSubmit={onSubmit}>
            <input type='text' placeholder='Name (optional)' 
                name='username' className='input__user-name'
                defaultValue={userName}/> 
            <br />
            <textarea placeholder="Message" name='usertext' 
                className='input__user-text'/>
            <div className='input__button-wrapper'>
                <button type='submit' className='input__submit-button'>Submit</button>
            </div>
        </form>
    )
}
