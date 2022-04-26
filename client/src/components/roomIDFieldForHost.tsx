import React, { useState, useEffect, useContext, useRef } from 'react';
import { trackPromise, usePromiseTracker } from 'react-promise-tracker';
import { AppContext } from '../context';
import { EventDispatcher } from '../reducer';
import { AppState, ChatRoom } from '../interface';
import { backendDomain } from '../settings'

export const RoomIDFieldForHost = () => {

    const [roomId, setRoomId] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [ requesting, setRequesting ] = useState(false);
    const popupRef = useRef(null);
    const { state, dispatcher } : 
    {state: AppState, dispatcher: EventDispatcher} = useContext(AppContext);
    const { numOfHostingRooms, hostingRoomLimit } = state;
    const fieldPlaceholder = 'Your Room #';
    const animeClass = 'appear-and-fadeout';
    const upperLimitErrMsg = `You can make up to ${hostingRoomLimit} rooms`;
    const serverErrMsg = 'Server error. Try again later..';
    const { promiseInProgress } = usePromiseTracker({ delay: 500 });
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
            setRequesting(true);
            const response: Response = 
                await trackPromise(fetch(`${backendDomain}/api/room/new`));
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
        } finally {
            setRequesting(false);
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
                <button type='button'
                    onClick={onClickCopyBtn}
                    disabled={roomId === ''}
                    className='host__copy-button'>Copy</button>
                <span className='host__copy-popup' 
                    onAnimationEnd={onAnimetionEnd} ref={popupRef}>Copied!</span>
            </div>
            <button type='button' onClick={onClickMakeRoomBtn}
                disabled={promiseInProgress && requesting}
                className='host__get-button'>
                    { promiseInProgress && requesting? 'Please wait...' : 'Give me Room #'}
            </button>
        </div>
    )
}
