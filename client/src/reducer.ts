import { AppState, ChatRoom, Message } from './interface';

export const initState: AppState = {
    activeRooms: [],
    maxRooms: 5,
    currentRoom: null
}

export const ACTION = {
    ADD: {
        ROOM: 'Add a new accesible room',
        MESSAGE: 'Add a new message to the current room'
    },
    UPDATE: {
    }, 
    CHANGE: {
        ROOM: 'Change the current room' 
    },
    DELETE: {
        ROOM: 'Remove a room'
    }
}

export const Reducer = (state, action) => {
    console.log(`New event dispatched: ${action}`);

    switch(action.type) {
        case ACTION.ADD.MESSAGE:
            {
                const message: Message = action.value;
                const { currentRoom } = state;

                if (!currentRoom)
                    return state;
                
                const updatedRoom: ChatRoom = {
                    ...currentRoom,
                    messages: [...currentRoom.messages.slice(), message]
                };

                return {
                    ...state,
                    currentRoom: updatedRoom,
                    activeRooms: state.activeRooms.map(room => {
                        if (room.id === updatedRoom.id)
                            return updatedRoom;
                        else
                            return room;
                    })
                }
            }
        
        case ACTION.CHANGE.ROOM:
            {
                const roomID = action.value;
                
            }
        
        
        default:
            return state;
    }
}