/** Landing Page **/

import React, { useState, useEffect, useReducer, useContext } from 'react';
import { AppContext } from '../context';
import { initState, Reducer, EventDispatcher } from '../reducer';
import { io } from 'socket.io-client';
import { ChatRoom } from '../interface';
import { Timer, Header } from '../components/common'; 
import { ChatRoomPage } from '../components/chatRoom';
import { hasRoomExpired } from '../util';

const testServerDomain = 'http://localhost:3000';

export const App = () => {
}

const RoomIDFieldForGuest = () => {
    
    const { dispatcher } = useContext(AppContext);
    const inputId = 'user-input';
    const placeholder = 'Tell me Room #';
    const onClick = async () => {
        
        const input: string = 
            (document.getElementById(inputId) as HTMLInputElement).value;

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

            const guestRoom: ChatRoom = {
                id: result.room.id,
                createdOn: result.room.createdOn,
                expiredOn: result.room.expiredOn,
                messages: [],
                participant: 0
            }

            dispatcher.addRoom(guestRoom);

        } catch (e) {
            //TODO: show an error message to the user
        }

        (document.getElementById(inputId) as HTMLInputElement).value = '';
    }

    return (
        <div>
            <input type='text' placeholder={placeholder} 
                id={inputId} className='guest__id-input'></input>
            <button type='button' onClick={onClick}
                className='guest__submit-button'>Enter</button>
        </div>
    )
}

const RoomIDFieldForHost = () => {

    const [id, setId] = useState('');
    const placeholder = 'Room# will appear here';
    const { state, dispatcher } = useContext(AppContext);

    const onClick = async () => {
        const response: Response = 
            await fetch(`${testServerDomain}/api/room/new`);
        const newRoomInfo = await response.json();

        if (newRoomInfo) {
            setId(newRoomInfo.id);

            //Server doesn't keep the user messages
            //so a message array added here for front-end use 
            const newRoom: ChatRoom = {
                ...newRoomInfo,
                messages: [],
                participant: 0
            }

            dispatcher.addRoom(newRoom);
        }
    }

    return (
        <div>
            <input type='input' readOnly id='input__roomID' 
                className='host__input'
                value={id} placeholder={placeholder}></input>
            <button type='button' onClick={onClick}
                className='host__get-button'>Make a Room</button>
        </div>
    )
}

/* ************************************* */
const ChatApp = () => {
    const [state, dispatch] = useReducer(Reducer, initState);
    const dispatcher: EventDispatcher = new EventDispatcher(dispatch);

    useEffect(() => {
        const soc = io(testServerDomain);

        soc.on('chat message', msg => {
           dispatcher.addMessage(msg);
        });

        soc.on('update participant', async (roomId) => {

            if (!roomId)
                return;

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
            
            if (result && result.size) 
                dispatcher.updateRoomParticipant(result.size);
           
        })

        dispatcher.addSocket(soc);

    }, []);
    

    return (
        <AppContext.Provider value={{state, dispatcher}}>
            { state.currentRoom? <ChatRoomPage/> : <TopPage/> }
        </AppContext.Provider>
        
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
                    <hr/>
                    <BlockForGuest />
                    <hr/>
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
    const { activeRooms } = state;

    return (
        <div className='room__container'>
            <p className='room__header'>Rooms</p>
            <ul className='room-list'>
                { activeRooms.length > 0? 
                  activeRooms.map((room: ChatRoom, count) => {

                    return (
                        <li key={`room-key-${count}`}>
                            <RoomTag room={room}/>
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
    const tagClass = 'room-tag ' + 
        (expired? 'room-tag--expired' : '')
    const indicatorClass = 'room-tag__indicator ' + 
        (expired? 'room-tag__indicator--expired' : '');
    const onClickTag = () => {
        if (room.id && socket) {
            dispatcher.changeRoom(room.id);
            socket.emit('enter room', room.id);
        } 
    }

    return (
        <div className={tagClass} onClick={onClickTag}> 
            <span className={indicatorClass}></span>
            <span className='room-tag__info-container'>
                <div className='room-tag__room-wrapper'>
                    <p className='room-tag__header'>Room #</p>
                    <p className='room-tag__value'><b>{room.id}</b></p>
                </div>
                <div className='room-tag__time-wrapper'>
                    <p className='room-tag__header'>Deleted in</p>
                    <b><Timer className='room-tag__value'
                        startTime={new Date().toISOString()}
                        endTime={room.expiredOn}/></b>
                </div>
            </span>
        </div>
    )
}


//TODO: Delete when unnecessary
export const Test = () => {

    return <ChatApp />
    
}