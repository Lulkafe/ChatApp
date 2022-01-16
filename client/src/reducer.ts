import { AppState } from './interface';

export const initState: AppState = {
    activeRooms: [],
    maxRooms: 5,
    currentRoom: null
}

export const ACTION = {
    UPDATE: {
        MESSAGE: 'Received a new message', 
        NEW_ROOM: 'Added a new accesible room'
    }, 
    DELETE: {
        ROOM: 'Removed a room'
    }
}

export const Reducer = (state, action) => {
    console.log(`New event dispatched: ${action}`);

    switch(action.type) {
        case ACTION.UPDATE.MESSAGE:
            
            return {
                messages: [...state.messages, action.value]
            }
        
        default:
            console.log('default')
            return state;
    }
}