import { render } from 'react-dom';
import React from 'react';
import { ChatApp } from './chatApp';
import '../style/style.sass';
import  {BrowserRouter } from 'react-router-dom';

render(
    <BrowserRouter>
        <ChatApp/>
    </BrowserRouter>, 
    document.getElementById('root'));
