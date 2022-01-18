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
    console.log(`New event dispatched: ${action.type}`);

    switch(action.type) {
        case ACTION.ADD.MESSAGE:
            {
                const message: Message = action.value;
                const { currentRoom } = state;

                console.log(currentRoom);

                if (!currentRoom)
                    return state;
                
                const updatedRoom: ChatRoom = {
                    ...currentRoom,
                    messages: [...currentRoom.messages.slice(), message]
                };

                console.log(updatedRoom);

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
        case ACTION.ADD.ROOM:
            {
                const newRoom: ChatRoom = action.value;
                return {
                    ...state,
                    activeRooms: [...state.activeRooms, newRoom]
                }
            }
        
        case ACTION.CHANGE.ROOM:
            {
                const roomID = action.value;
                const room: ChatRoom = state.activeRooms.find(rm => rm.id === roomID);

                if (!room)
                    return state;

                return {
                    ...state, 
                    currentRoom: room
                }
            }
        
        default:
            return state;
    }
}