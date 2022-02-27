import { render } from 'react-dom';
import React from 'react';
import { ChatApp } from './components/homePage';
import './style/style.sass';
import  {BrowserRouter } from 'react-router-dom';

render(
    <BrowserRouter>
        <ChatApp/>
    </BrowserRouter>, 
    document.getElementById('root'));
