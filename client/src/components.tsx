import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const App = () => {

    useEffect(() => {
        console.log('Inside UseEffect');
        const socket = io();
    }, []);

    return (
        <div>
            <div className='test__massage-field'>
                <ul className='test__message-list'>
                   <li>Text Message appears below</li> 
                </ul>
            </div>
            <form>
                <input type='text' placeholder="chat text"></input>
                <button type='submit'>Submit</button>
            </form>
        </div>
    )
}


//Test component to check functionality. Will be removed later
const Test = () => {

    const onSubmit = (e) => {
        e.preventDefault();
    }

    return (
        <div>
            <ul id='test__message-list'></ul>
            <form onSubmit={onSubmit}>
                <input type='text'></input>
                <button type='submit'></button>
            </form>
        </div>
    )
}