import React, { useEffect, useReducer } from 'react';
import { AppContext } from '../context';
import { initState, Reducer, EventDispatcher } from '../reducer';
import { io } from 'socket.io-client';
import { AppState } from '../interface';
import { ChatRoomPage } from './chatRoom';
import { Routes, Route } from 'react-router-dom';
import { backendDomain, rootPath } from '../settings'
import { getStoredState, saveInSessionStorage } from '../util';
import { HomePage } from './homePage';

export const ChatApp = () => {
    const [state, dispatch] = useReducer(Reducer, initState);
    const dispatcher: EventDispatcher = new EventDispatcher(dispatch);

    //Initialization
    useEffect(() => {
        const soc = io(backendDomain);

        soc.on('chat message', msg => {
           dispatcher.addMessage(msg);
        });

        soc.on('update participant', async (roomId) => {

            if (!roomId) return;

            const response: Response =
                await fetch(`${backendDomain}/api/room/size`, {
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
                <Route path={`${rootPath}`} element={<HomePage/>}/>
                <Route path={`${rootPath}:id`} element={<ChatRoomPage/>}/>
            </Routes>
        </AppContext.Provider>
    )
}