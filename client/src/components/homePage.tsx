import React, { useState, useEffect, useReducer, useContext, useRef } from 'react';
import { AppContext } from '../context';
import { initState, Reducer, EventDispatcher } from '../reducer';
import { io } from 'socket.io-client';
import { AppState, ChatRoom, TimerEvent } from '../interface';
import { Timer, SiteHeader } from './common'; 
import { ChatRoomPage } from './chatRoom';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import PersonImage from '../image/person.png';
import { calcTimeDiff, getStoredState, saveInSessionStorage } from '../util';

const originURL = window.location.origin;

export const ChatApp = () => {
    const [state, dispatch] = useReducer(Reducer, initState);
    const dispatcher: EventDispatcher = new EventDispatcher(dispatch);

    //Initialization
    useEffect(() => {
        const soc = io();

        soc.on('chat message', msg => {
           dispatcher.addMessage(msg);
        });

        soc.on('update participant', async (roomId) => {

            if (!roomId) return;

            const response: Response =
                await fetch(`${originURL}/api/room/size`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ roomId })
                });

            const result = await response.json();
            
            if (result && result?.size) 
                dispatcher.updateRoomParticipant(result.size);
           
        })

        dispatcher.addSocket(soc);

        const storedState: AppState | null = getStoredState();
        if (storedState)
            dispatcher.loadData({...storedState, socket: soc});
    }, []);

    useEffect(() => {
        saveInSessionStorage(state);
    }, [state])
    
    return (
        <AppContext.Provider value={{state, dispatcher}}>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/:id" element={<ChatRoomPage/>}/>
            </Routes>
        </AppContext.Provider>
    )
}

const RoomIDFieldForGuest = () => {
    
    const { state, dispatcher } 
        : { state: AppState, dispatcher : EventDispatcher} = useContext(AppContext);
    const [ errMsg, setErrMsg ] = useState('');
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const maxInputLength = 4;
    const inputPlaceholder = 'Tell us Room #';
    const serverErrMsg = 'Server error. Try again later..';
    const moveToChatRoom = (roomId: string) => {
        dispatcher.changeRoom(roomId);
        state?.socket.emit('enter room', roomId);
        navigate(`/${roomId}`);
    }
    const onClick = async () => {
        const input: string = inputRef.current.value.trim().toUpperCase();
        const roomAlreadyAdded = 
            state.rooms.findIndex(room => room.id === input) == -1? false : true;

        if (roomAlreadyAdded) {
            moveToChatRoom(input);
            return;
        }

        try {
            const response: Response =
            await fetch(`${originURL}/api/room/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ roomId: input })
            });

            const result = await response.json();

            if ('error' in result) {
                setErrMsg(result.error);
                return;
            } 

            const guestRoom: ChatRoom = {
                id: result.room.id,
                createdOn: result.room.createdOn,
                expiredOn: result.room.expiredOn,
                messages: [],
                participant: 0,
                amIHost: false
            }

            dispatcher.addRoom(guestRoom);
            moveToChatRoom(guestRoom.id);
            return;
            
        } catch (e) {
            setErrMsg(serverErrMsg);
            inputRef.current.value = '';
        }
    }

    return (
        <div className='guest__field-wrapper'>
            {errMsg && <p className='guest__err-msg'>{errMsg}</p>}
            <input type='text' 
                placeholder={inputPlaceholder}
                maxLength={maxInputLength}
                ref={inputRef} 
                className={'guest__id-input' + 
                    (errMsg? ' warning-border' : ' ')}
            />
            <button type='button' onClick={onClick}
                className='guest__submit-button'>Enter</button>
        </div>
    )
}

const RoomIDFieldForHost = () => {

    const [roomId, setRoomId] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const popupRef = useRef(null);
    const { state, dispatcher } : 
    {state: AppState, dispatcher: EventDispatcher} = useContext(AppContext);
    const { numOfHostingRooms, hostingRoomLimit } = state;
    const fieldPlaceholder = 'Your Room #';
    const animeClass = 'appear-and-fadeout';
    const upperLimitErrMsg = `You can make up to ${hostingRoomLimit} rooms`;
    const serverErrMsg = 'Server error. Try again later..';
    const onClickCopyBtn = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(roomId);
        popupRef.current.classList.add(animeClass);
    }
    const onAnimetionEnd = (e) => {
        e.stopPropagation();
        popupRef.current.classList.remove(animeClass);
    }

    const onClickMakeRoomBtn = async (e) => {

        e.stopPropagation();

        if (numOfHostingRooms >= hostingRoomLimit){
            setErrMsg(upperLimitErrMsg)
            return;
        } 

        try {
            const response: Response = 
            await fetch(`${originURL}/api/room/new`);
            const newRoomInfo = await response.json();

            if ('error' in newRoomInfo) {
                setErrMsg(newRoomInfo.error);
                setRoomId('');
                return;
            }

            setRoomId(newRoomInfo.id);

            //Server doesn't keep the user messages
            //so a message array added here for front-end use 
            const newRoom: ChatRoom = {
                ...newRoomInfo,
                messages: [],
                participant: 0,
                amIHost: true
            }

            setErrMsg('');
            dispatcher.addRoom(newRoom);
        
        } catch (e) {
            setErrMsg(serverErrMsg)
        }
        
    }

    useEffect(() => {
        const hostingRoomExpired = 
            (state.rooms.findIndex(room => room.id == roomId)) < 0;
    
        if (hostingRoomExpired)
            setRoomId('');

        if (numOfHostingRooms < hostingRoomLimit &&
            errMsg === upperLimitErrMsg)
            setErrMsg('');

    }, [state.rooms])

    return (
        <div>
            {errMsg && <p className='host__err-msg'>{errMsg}</p>}
            <div className='host__input-wrapper'>
                <input type='input' readOnly
                    value={roomId} 
                    placeholder={fieldPlaceholder} 
                    className={'host__input' + 
                        (errMsg? ' warning-border' : '' )} 
                />
                <button className='host__copy-button'
                    onClick={onClickCopyBtn}
                    disabled={roomId == ''}>Copy</button>
                <span className='host__copy-popup' 
                    onAnimationEnd={onAnimetionEnd} ref={popupRef}>Copied!</span>
            </div>
            <button type='button' onClick={onClickMakeRoomBtn}
                className='host__get-button'>Give me Room #</button>
        </div>
    )
}

const HomePage = () => {
    return (
        <div>
            <SiteHeader/>
            <HomePageBody>
                <MessageToUser/>
                <ContentContainer>
                    <BlockForHost />
                    <hr className='section-separator'/>
                    <BlockForGuest />
                    <hr className='section-separator'/>
                    <BlockForRooms />
                </ContentContainer>
                <Footer/>
            </HomePageBody>
        </div>
    )
}

const Footer = () => {
    return (
        <footer className='footer-wrapper'>
            <img src={PersonImage} alt='Person who speaks with a speechballoon' 
                className='person-image'/>
        </footer>
    )
}

const HomePageBody = (props) => {
    return (
        <main className='toppage-body-container'>
            { props.children }
        </main>
    )
}

const MessageToUser = () => {
    return (
        <div className='site-message'>
            <h1 className='site-message__main'>No Sign-up.<br/>Auto-delete in 1 hour.</h1>
            <h2 className='site-message__sub'>Room# is only what you need.</h2>
        </div>
    )
}

const ContentContainer = (props) => {
    return (
        <div className='content-container'>
            { props.children }
        </div>
    )
}

const BlockForHost = () => {
    return (
        <div className='host__container'>
            <h3 className='host__message'>Get your room #</h3>
            <RoomIDFieldForHost />
        </div>
    )
}

const BlockForGuest = () => {
    return (
        <div className='guest__container'>
            <h3 className='guest__message'>Are you a guest?</h3>
            <RoomIDFieldForGuest />
        </div>
    )
}

const BlockForRooms = () => {
    
    const { state } : { state: AppState } = useContext(AppContext);
    const { rooms } = state;

    return (
        <div className='room__container'>
            <h3 className='room__header'><span>Your rooms</span></h3>
            <ul className='room-list'>
                { rooms.length > 0? 
                  rooms.map((room: ChatRoom, i) => {

                    return (
                        <li key={`room-key-${i}`}>
                            <Link to={`/${room.id}`} 
                                className='link-tag'>
                                <RoomTag room={room}/>
                            </Link>
                        </li>
                    )
                  }) :
                  <p className='room__message'>No room is available yet..</p>
                }
            </ul>
        </div>
    )
}

const RoomTag = (props) => {
    
    const { state, dispatcher } : 
        { state: AppState, dispatcher: EventDispatcher} = useContext(AppContext);
    const { room }: { room: ChatRoom } = props;
    const indicactorBaseClass = 'room-tag__indicator'
    const [ indicatorClass, setIndicatorClass ] = useState(indicactorBaseClass);
    const indicatorYellow = `${indicactorBaseClass} ${indicactorBaseClass}--yellow`;
    const indicatorRed = `${indicactorBaseClass} ${indicactorBaseClass}--red`;
    const { socket } = state;
    const onClickTag = () => {
        if (room.id && socket) {
            dispatcher.changeRoom(room.id);
            socket.emit('enter room', room.id);
        } 
    }
    const timerEvents: Array<TimerEvent> = [
        { 
            minute: 5,
            second: 0,
            callback: function () { setIndicatorClass(indicatorYellow) }
        },
        { 
            minute: 1,
            second: 0,
            callback: function () { setIndicatorClass(indicatorRed) }
        }
    ];

    useEffect(() => {
        const timeDiff = calcTimeDiff(
            new Date().toISOString(), room.expiredOn);
        if (timeDiff.min < 1)
            setIndicatorClass(indicatorRed);
        else if (timeDiff.min < 5)
            setIndicatorClass(indicatorYellow);        
    }, [])

    return (
        <div className='room-tag' onClick={onClickTag}> 
            <span className={indicatorClass}></span>
            <span className='room-tag__info-container'>
                <div className='room-tag__room-wrapper'>
                    <p className='room-tag__header'>Room #</p>
                    <p className='room-tag__value'><b>{room.id}</b></p>
                </div>
                <div className='room-tag__time-wrapper'>
                    <p className='room-tag__header'>Deleted in</p>
                    <b><Timer className='room-tag__value'
                        onExpired={() => dispatcher.expireRoom(room.id)}
                        startTime={new Date().toISOString()}
                        endTime={room.expiredOn}
                        timerEvents={timerEvents}/></b>
                </div>
            </span>
        </div>
    )
}
