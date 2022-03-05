import React, { useState, useEffect, useReducer, useContext, useRef } from 'react';
import { AppContext } from '../context';
import { initState, Reducer, EventDispatcher } from '../reducer';
import { io } from 'socket.io-client';
import { AppState, ChatRoom } from '../interface';
import { Timer, SiteHeader } from './common'; 
import { ChatRoomPage } from './chatRoom';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import PersonImage from '../image/person.png';

const testServerDomain = 'http://localhost:3000';

export const ChatApp = () => {
    const [state, dispatch] = useReducer(Reducer, initState);
    const dispatcher: EventDispatcher = new EventDispatcher(dispatch);

    //Initialization
    useEffect(() => {
        const soc = io(testServerDomain);

        soc.on('chat message', msg => {
           dispatcher.addMessage(msg);
        });

        soc.on('update participant', async (roomId) => {

            if (!roomId) return;

            const response: Response =
                await fetch(`${testServerDomain}/api/room/size`, {
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

    }, []);
    
    return (
        <AppContext.Provider value={{state, dispatcher}}>
            <Routes>
                <Route path="/" element={<TopPage/>}/>
                <Route path='/:id' element={<ChatRoomPage/>}/>
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
    const inputPlaceholder = 'Tell me Room #';
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
            await fetch(`${testServerDomain}/api/room/check`, {
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
            <p className='guest__err-msg'>{errMsg}</p>
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
    const { state, dispatcher } : 
    {state: AppState, dispatcher: EventDispatcher} = useContext(AppContext);
    const { numOfHostingRooms, hostingRoomLimit } = state;
    const fieldPlaceholder = 'Room# will appear here';
    const upperLimitErrMsg = `You can make up to ${hostingRoomLimit} rooms`;
    const serverErrMsg = 'Server error. Try again later..';

    const onClick = async () => {

        if (numOfHostingRooms >= hostingRoomLimit){
            setErrMsg(upperLimitErrMsg)
            return;
        } 

        try {
            const response: Response = 
            await fetch(`${testServerDomain}/api/room/new`);
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
            <p className='host__err-msg'>{errMsg}</p>
            <input type='input' readOnly
                value={roomId} 
                placeholder={fieldPlaceholder} 
                className={'host__input' + 
                    (errMsg? ' warning-border' : '' )} 
            />
            <button type='button' onClick={onClick}
                className='host__get-button'>Make a Room</button>
        </div>
    )
}

const TopPage = () => {
    return (
        <div>
            <SiteHeader/>
            <TopPageBody>
                <MessageToUser/>
                <ContentContainer>
                    <BlockForHost />
                    <hr className='section-separator'/>
                    <BlockForGuest />
                    <hr className='section-separator'/>
                    <BlockForRooms />
                </ContentContainer>
                <Footer/>
            </TopPageBody>
        </div>
    )
}

const Footer = () => {
    return (
        <footer className='footer-wrapper'>
            <img src={PersonImage} className='person-image'/>
        </footer>
    )
}

const TopPageBody = (props) => {
    return (
        <div className='toppage-body-container'>
            { props.children }
        </div>
    )
}

const MessageToUser = () => {
    return (
        <div className='site-message'>
            <h1 className='site-message__main'>Need to chat but<br/>don't want to sign up?</h1>
            <h3 className='site-message__sub'>No worry.<br/>Room# is only what you need.</h3>
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
            <p className='host__message'>Need a chatroom? &#128172;</p>
            <RoomIDFieldForHost />
        </div>
    )
}

const BlockForGuest = () => {
    return (
        <div className='guest__container'>
            <p className='guest__message'>Are you a guest?</p>
            <RoomIDFieldForGuest />
        </div>
    )
}

const BlockForRooms = () => {
    
    const { state } : { state: AppState } = useContext(AppContext);
    const { rooms } = state;

    return (
        <div className='room__container'>
            <p className='room__header'><span>Your room</span></p>
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
    const { socket } = state;
    const onClickTag = () => {
        if (room.id && socket) {
            dispatcher.changeRoom(room.id);
            socket.emit('enter room', room.id);
        } 
    }

    return (
        <div className='room-tag' onClick={onClickTag}> 
            <span className='room-tag__indicator'></span>
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
                        endTime={room.expiredOn}/></b>
                </div>
            </span>
        </div>
    )
}
