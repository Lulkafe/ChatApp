import React, { useState, useEffect, createContext } from 'react';
import { useReducer, useContext } from 'react';
import { initState, Reducer, EventDispatcher } from './reducer';
import { io } from 'socket.io-client';
import { MessageFrame, ChatRoom } from './interface';

const testServerDomain = 'http://localhost:3000';
const AppContext = createContext(undefined);

export const App = () => {

    const [socket, setSocket] = useState(null);
    const [state, dispatch] = useReducer(Reducer, initState);
    const dispatcher: EventDispatcher = new EventDispatcher(dispatch);
    const { currentRoom, activeRooms } = state;
    const onClick = (roomID) => 
        () => dispatcher.changeRoom(roomID);

    useEffect(() => {
        const soc = io(testServerDomain);
        setSocket(soc);

        soc.on('chat message', msg => {
           dispatcher.addMessage(msg);
        });

    }, []);

    return (
        <div>
            <AppContext.Provider value={{state, dispatcher}}>
                <ul>
                    <li>Current Room: <span>{ currentRoom? currentRoom.id : 'NONE' }</span></li>
                    {  
                       activeRooms.length > 0 &&
                       activeRooms.map((room, i) => {
                        return (
                            <li key={`r${i}`}>{room.id}
                                <button onClick={ onClick(room.id) }>Go</button>
                            </li>)
                    })
                    }
                    <li>Chat Messages will appear below</li> 
                    { currentRoom && 
                      currentRoom.messages
                        .map((message, i) => <li key={i}>{message.text}</li>) }
                </ul>
                <ChatMessageInput socket={socket} />
                <RoomIDFieldForGuest/>
                <RoomIDFieldForHost/>
            </AppContext.Provider>
        </div>
    )
}

//This Input field only appears when a room displays 
const ChatMessageInput = (props) => {

    const { socket } = props;
    const { state } = useContext(AppContext);  
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
                <input type='text' placeholder="chat text" id='input'></input>
                <button type='submit' >Submit</button>
            </form>
        </div>
    )
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
            <button type='button' onClick={onClick}>Reserve</button>
        </div>
    )
}
