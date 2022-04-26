import React, { useContext } from 'react';
import { AppContext } from '../context';
import { AppState, ChatRoom } from '../interface';
import { SiteHeader } from './common'; 
import { Link } from 'react-router-dom';
import PersonImage from '../image/person.png';
import { rootPath } from '../settings'
import { RoomIDFieldForGuest } from './roomIDFieldForGuest';
import { RoomIDFieldForHost } from './roomIDFieldForHost';
import { RoomTag } from './roomTag';

export const HomePage = () => {
    return (
        <div>
            <SiteHeader/>
            <HomePageBody>
                <MessageToUser/>
                <ContentContainer>
                    <SectionForHost />
                    <hr className='section-separator'/>
                    <SectionForGuest />
                    <hr className='section-separator'/>
                    <SectionForRooms />
                </ContentContainer>
                <Footer/>
            </HomePageBody>
        </div>
    )
}

const HomePageBody = (props) => {
    return (
        <main className='toppage-body-container'>
            { props.children }
        </main>
    )
}

const MessageToUser = () => {
    return (
        <div className='site-message'>
            <h1 className='site-message__main'>No Sign-up.<br/>Auto-delete in 1 hour.</h1>
            <h2 className='site-message__sub'>Room# is only what you need.</h2>
        </div>
    )
}

const ContentContainer = (props) => {
    return (
        <div className='content-container'>
            { props.children }
        </div>
    )
}

const SectionForHost = () => {
    return (
        <div className='host__container'>
            <h3 className='host__message'>
                <span>Need a chatroom?</span></h3>
            <RoomIDFieldForHost />
        </div>
    )
}

const SectionForGuest = () => {
    return (
        <div className='guest__container'>
            <h3 className='guest__message'>
                Are you a guest?</h3>
            <RoomIDFieldForGuest />
        </div>
    )
}

const SectionForRooms = () => {
    
    const { state } : { state: AppState } = useContext(AppContext);
    const { rooms } = state;

    return (
        <div className='room__container'>
            <h3 className='room__header'>
                 Your rooms</h3>
            <ul className='room-list'>
                { rooms.length > 0? 
                  rooms.map((room: ChatRoom, i) => {

                    return (
                        <li key={`room-key-${i}`}>
                            <Link to={`${rootPath}${room.id}`} 
                                className='link-tag'>
                                <RoomTag room={room}/>
                            </Link>
                        </li>
                    )
                  }) :
                  <p className='room__message'>No room is available yet..</p>
                }
            </ul>
        </div>
    )
}

const Footer = () => {
    return (
        <footer className='footer-wrapper'>
            <img src={PersonImage} alt='Person who speaks with a speechballoon' 
                className='person-image'/>
        </footer>
    )
}
