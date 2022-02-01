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
            <input type='text' placeholder={placeholder} id={inputId}></input>
            <button type='button' onClick={onClick}>Confirm</button>
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
                value={id} placeholder={placeholder}></input>
            <button type='button' onClick={onClick}>Make a Room</button>
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
        <div>
            { props.children }
        </div>
    )
}

const BlockForHost = () => {
    return (
        <div>
            <p>Need a chatroom? &#128172;</p>
            <RoomIDFieldForHost />
        </div>
    )
}

const BlockForGuest = () => {
    return (
        <div>
            <p>Are you invited?</p>
            <RoomIDFieldForGuest />
        </div>
    )
}

const BlockForRooms = () => {
    
    return (
        <ul>
            
        </ul>
    )
}


//TODO: Delete when unnecessary
export const Test = () => {

    return <ChatApp />
}