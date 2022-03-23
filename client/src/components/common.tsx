import React, { useRef, useState } from 'react';
import useInterval from 'react-useinterval';
import { calcTimeDiff } from '../util'
import SiteLogoIcon from '../image/site-logo.png';
import { Link } from 'react-router-dom';
import { TimerEvent } from '../interface';

export const Timer = (props) => {
    const timerEvents: Array<TimerEvent> = props.timerEvents;
    const onExpired = props.onExpired;
    const initialTime = props.startTime || new Date();
    const endTime = props.endTime || new Date();
    const timeLeft = calcTimeDiff(initialTime, endTime);
    const [second, setSecond] = useState(timeLeft.sec);
    const [minute, setMinute] = useState(timeLeft.min);
    const pad0 = (n: number) => n.toString().padStart(2, '0');
    
    useInterval(() => {

        if (timerEvents?.length > 0) 
            timerEvents.forEach((te: TimerEvent) => {
                if (te.minute == minute && te.second == second)
                    te.callback();
            })
        
        if (minute < 0 ||
            (second <= 0 && minute <= 0)) {
            setSecond(0);
            setMinute(0);
            if (typeof onExpired === 'function') 
                onExpired();
        } else {
            const curTime = new Date().toISOString();
            const remaining = calcTimeDiff(curTime, endTime);
            setMinute(remaining.min);
            setSecond(remaining.sec);
        }

    }, 1000);

    return (
        <span className={props.className}>
            {pad0(minute)}:{pad0(second)}
        </span>
    )
}


export const ToggleSwitch = (props) => {
    const checkBoxRef = useRef(null);
    const onChange = () => {
        props?.onChange(checkBoxRef.current.checked);
    }

    return (
        <label className='toggle__container'>
            <input className='toggle__checkbox' 
                type='checkbox' ref={checkBoxRef}
                onChange={onChange}/>
            <span className='toggle__slider'/>
        </label>
    )
}


export const SiteHeader = () => {
    return (
        <header className='site-header'>
            <Link to={'/'}>
                <img className='site-header__logo-img' alt='Site logo' src={SiteLogoIcon}/>
            </Link>
        </header>
    )
}

