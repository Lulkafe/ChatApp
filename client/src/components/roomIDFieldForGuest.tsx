import React, { useState, useContext, useRef } from 'react';
import { trackPromise, usePromiseTracker } from 'react-promise-tracker';
import { AppContext } from '../context';
import { EventDispatcher } from '../reducer';
import { AppState, ChatRoom } from '../interface';
import { useNavigate } from 'react-router-dom';
import { backendDomain, rootPath } from '../settings'

export const RoomIDFieldForGuest = () => {
    const { state, dispatcher } 
        : { state: AppState, dispatcher : EventDispatcher} = useContext(AppContext);
    const [ requesting, setRequesting ] = useState(false);
    const [ errMsg, setErrMsg ] = useState('');
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const maxInputLength = 4;
    const inputPlaceholder = 'Tell us Room #';
    const serverErrMsg = 'Server error. Try again later..';
    const moveToChatRoom = (roomId: string) => {
        dispatcher.changeRoom(roomId);
        state?.socket.emit('enter room', roomId);
        navigate(`${rootPath}${roomId}`);
    }
    const { promiseInProgress } = usePromiseTracker({ delay: 500 });
    const onClick = async () => {
        const input: string = inputRef.current.value.trim().toUpperCase();
        const roomAlreadyAdded = 
            state.rooms.findIndex(room => room.id === input) == -1? false : true;

        if (roomAlreadyAdded) {
            moveToChatRoom(input);
            return;
        }

        try {
            setRequesting(true);
            const response: Response =
            await trackPromise(fetch(`${backendDomain}/api/room/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ roomId: input })
            }));

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
        } finally {
            setRequesting(false);
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
                disabled={ promiseInProgress && requesting }
                className='guest__submit-button'>
                    { promiseInProgress && requesting? "Please wait..." : "Enter" }
            </button>
        </div>
    )
}
