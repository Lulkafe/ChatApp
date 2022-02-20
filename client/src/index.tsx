import { render } from 'react-dom';
import React from 'react';
import { ChatApp } from './components/topPage';
import './style/style.sass';
import  {BrowserRouter } from 'react-router-dom';

render(
    <BrowserRouter>
        <ChatApp/>
    </BrowserRouter>, 
    document.getElementById('root'));
