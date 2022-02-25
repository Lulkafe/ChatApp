/** Landing Page **/

import React, { useState, useEffect, useReducer, useContext, useRef } from 'react';
import { AppContext } from '../context';
import { initState, Reducer, EventDispatcher } from '../reducer';
import { io } from 'socket.io-client';
import { ChatRoom } from '../interface';
import { Timer, Header } from '../components/common'; 
import { ChatRoomPage } from '../components/chatRoom';
import { hasRoomExpired } from '../util';
import { Routes, Route, Link } from 'react-router-dom';

const testServerDomain = 'http://localhost:3000';

const Test = () => {
    return <p>Test!</p>;
}

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
    
    const { dispatcher } = useContext(AppContext);
    const [ errMsg, setErrMsg ] = useState('');
    const inputRef = useRef(null);
    const placeholder = 'Tell me Room #';
    const onClick = async () => {
        const input: string = inputRef.current.value;

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
                participant: 0
            }

            setErrMsg('');
            dispatcher.addRoom(guestRoom);

        } catch (e) {
            setErrMsg('Server error. Try again later..')
        }

        inputRef.current.value = '';
    }

    return (
        <div className='guest__field-wrapper'>
            <p className='guest__err-msg'>{errMsg}</p>
            <input type='text' 
                placeholder={placeholder}
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
    const placeholder = 'Room# will appear here';
    const { state, dispatcher } = useContext(AppContext);

    const onClick = async () => {

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
                participant: 0
            }

            setErrMsg('');
            dispatcher.addRoom(newRoom);
        
        } catch (e) {
            setErrMsg('Server error. Try again later..')
        }
        
    }

    useEffect(() => {
        const hasRoomExpired = 
            (state.rooms.findIndex(room => room.id == roomId)) < 0;
            
        if (hasRoomExpired)
            setRoomId('');
    }, [state.rooms])

    return (
        <div>
            <p className='host__err-msg'>{errMsg}</p>
            <input type='input' readOnly id='input__roomID' 
                value={roomId} 
                placeholder={placeholder} 
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
            <Header/>
            <TopPageBody>
                <MessageToUser/>
                <ContentContainer>
                    <BlockForHost />
                    <hr className='section-separator'/>
                    <BlockForGuest />
                    <hr className='section-separator'/>
                    <BlockForRooms />
                </ContentContainer>
            </TopPageBody>
        </div>
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
        <div>
            <h1>No Sign-up. No Login.</h1>
            <h3>Chat history is deleted in an hour.</h3>
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
            <p className='guest__message'>Are you invited?</p>
            <RoomIDFieldForGuest />
        </div>
    )
}

const BlockForRooms = () => {
    
    const { state } = useContext(AppContext);
    const { rooms } = state;

    return (
        <div className='room__container'>
            <p className='room__header'>Rooms</p>
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
                  <p className='room__message'>No room is available now..</p>
                }
            </ul>
        </div>
    )
}

const RoomTag = (props) => {
    
    const { state, dispatcher } = useContext(AppContext);
    const { room }: { room: ChatRoom } = props;
    const { socket } = state;
    const expired = hasRoomExpired(room);
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
