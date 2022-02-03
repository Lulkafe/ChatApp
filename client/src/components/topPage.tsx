/** Landing Page **/

import React, { useState, useEffect, useReducer, useContext } from 'react';
import { AppContext } from '../context';
import { initState, Reducer, EventDispatcher } from '../reducer';
import { io } from 'socket.io-client';
import { MessageFrame, ChatRoom } from '../interface';
import { Timer, Header } from '../components/common'; 

const testServerDomain = 'http://localhost:3000';

export const App = () => {
}

const RoomIDFieldForGuest = () => {
    
    const inputId = 'user-input';
    const placeholder = 'Tell me Room #';
    const onClick = async () => {
        
        const input: string = 
            (document.getElementById(inputId) as HTMLInputElement).value;

        const response: Response =
            await fetch(`${testServerDomain}/api/roomID`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ roomId: input })
            });

        const result = await response.json();

        if (result) {
            //This room exists (= the guess can access now)

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

    const onClick = () => {
        //In real implementation,
        //this should count how many IDs have been generated
        //in order to avoid that one user generates too many IDs

        //Return (success): id (string)
        //       (failure): null 

        //const response: Response = await fetch(`${testServerDomain}/api/roomID`);
        //const { roomID } = await response.json();

        const newRoom: ChatRoom = {
            id: 'A1234',
            messages: [],
            createdOn: new Date().toISOString(),
            expiredOn: '20'
        }

        if (newRoom) {
            setId(newRoom.id);
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

        dispatcher.addSocket(soc);
    }, []);

    return (
        <div>
            <AppContext.Provider value={{state, dispatcher}}>
                <TopPage />
            </AppContext.Provider>
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
    
    return (
        <ul className='room-list'>
            <li><RoomTag/></li>
        </ul>
    )
}

const RoomTag = (props) => {
    
    const min = props.min | 60;
    const sec = props.sec | 0;
    const roomId = props.roomId || 'N/A';

    return (
        <div className='room-tag'> 
            <span className='room-tag__indicator'></span>
            <span className='room-tag__info-container'>
                <div className='room-tag__room-wrapper'>
                    <p className='room-tag__header'>Room #</p>
                    <p className='room-tag__value'><b>FA1AD</b></p>
                </div>
                <div className='room-tag__time-wrapper'>
                    <p className='room-tag__header'>Deleted in</p>
                    <b><Timer className='room-tag__value'/></b>
                </div>
            </span>
        </div>
    )
}


//TODO: Delete when unnecessary
export const Test = () => {

    return <ChatApp />
}