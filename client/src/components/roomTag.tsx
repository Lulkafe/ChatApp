import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context';
import { EventDispatcher } from '../reducer';
import { AppState, ChatRoom, TimerEvent } from '../interface';
import { Timer } from './common'; 
import { calcTimeDiff } from '../util';

export const RoomTag = (props) => {
    
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