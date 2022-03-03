import React, { useContext, useEffect, useState, useRef } from 'react'
import { AppState, ChatRoom, MessageFrame, Message  } from '../interface';
import { AppContext } from '../context'
import { SiteHeader, Timer } from '../components/common';
import { Navigate } from 'react-router-dom';
import { EventDispatcher } from '../reducer';
import PersonLogo from '../image/person-logo.png';

export const ChatRoomPage = () => {
    const { state } : { state: AppState }= useContext(AppContext); 
    const { currentRoom, socket } = state;

    useEffect(() => {
        return () => { 
            if (currentRoom)
                socket.emit('leave room', currentRoom.id); 
        }
    },[])

    return (
        currentRoom? 
            <div className='chat-page__wrapper'>
                <SiteHeader/>
                {currentRoom && <StatusBar/>}
                <ChatPageBody>
                    <ChatMsgContainer/>
                    <ChatMessageInput/>
                </ChatPageBody>
            </div>
        : <Navigate to='/'/>
    )
}

const StatusBar = () => {
    const { state, dispatcher } : 
        {state: AppState, dispatcher: EventDispatcher} = useContext(AppContext);
    const curRoom: ChatRoom = state.currentRoom;
    const roomId = state.currentRoom.id;
    const participant = curRoom.participant;

    return (
        <div className='status-bar'>
            <div className='status-bar__content-wrapper'>
                <span className='status-bar__roomId'>&#128273; {roomId}</span>
                <span className='status-bar__participants'>
                    <img className='status-bar__participants-image' 
                         src={PersonLogo}/> {participant}
                </span>
                <span className='status-bar__timer'>&#128465; Deleted in <Timer
                    onExpired={() => dispatcher.expireRoom(roomId)}
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
    const { state } : { state: AppState } = useContext(AppContext);
    const { currentRoom } : {currentRoom: ChatRoom } = state;
    const msgContainerRef = useRef(null);

    useEffect(() => {
        msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight;
    }, [state.currentRoom.messages]);

    return (
        <div className='chat-msg__container-shape'>  
            <div className='chat-msg__container' ref={msgContainerRef}>     
                { currentRoom.messages.length === 0?
                    <p className='chat-msg__no-comment-message'>No comment yet..</p>
                    :
                    currentRoom.messages.map((message, i) => {
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
    let cls = 'speech-balloon';
    
    if (userName)
        cls += ' speech-balloon--with-username';
    
    if (isMyComment)
        cls += ' speech-balloon--mine';

    return (
        <div className={cls}>
            { userName && <span className='speech-balloon__username'>{userName}:</span>}
            <p className='speech-balloon__text'>{message}</p>
        </div>
    )
}

const ChatMessageInput = () => {
    const { state, dispatcher } : 
        { state: AppState, dispatcher: EventDispatcher } = useContext(AppContext); 
    const { socket, currentRoom } = state; 
    const [userName, setUserName] = useState('');
    const [enterToSubmit, setEnterToSubmit] = useState(false);
    const checkBoxRef = useRef(null);
    const formRef = useRef(null);
    const textRef = useRef(null);
    const nameInputRef = useRef(null);
    const maxLengthName = 20;
    const maxLengthText = 500;
    const onClick = () => {
        const textArea = textRef.current;
        const nameInput = nameInputRef.current;

        if (nameInput.value) 
            setUserName(nameInput.value);

        const msgKeptLocally: Message = {
                text: textArea.value,
                userName : nameInput.value,
                commentedOn: new Date().toISOString(),
                isMyComment: true
            }

        const msgToOthers: MessageFrame = {
            message: {
                ...msgKeptLocally,
                isMyComment: false
            },
            roomId: currentRoom.id
        }
        
        if (textArea.value && socket) {
            socket.emit('chat message', msgToOthers);
            dispatcher.addMessage(msgKeptLocally);
        }

        textArea.value = ''
    };
    const onChangeCheckBox = () => {
        setEnterToSubmit(checkBoxRef.current.checked);
    }
    const onKeyEnter = (e) => {
        if (enterToSubmit && e.keyCode == 13)  
            onClick();
    }

    return (
        <form className='input__form' ref={formRef}>
            <div className='input__option-wrapper'>
                <input type='text' placeholder='Name (optional)' 
                    name='username' className='input__user-name'
                    defaultValue={userName}
                    ref={nameInputRef}
                    maxLength={maxLengthName}/>
                <div className='enter-checkbox__wrapper'> 
                    <input type='checkbox' 
                        className='enter-checkbox__input' 
                        onChange={onChangeCheckBox}
                        ref={checkBoxRef}/>
                    <label className='enter-checkbox__label'>Enter to submit</label>
                </div>
            </div>
            <textarea placeholder="Type here" name='usertext' 
                className='input__user-text'
                onKeyUp={onKeyEnter}
                ref={textRef}
                maxLength={maxLengthText}/>
            <div className='input__button-wrapper'>
                <button type='button' className='input__submit-button' onClick={onClick}>Submit</button>
            </div>
        </form>
    )
}
