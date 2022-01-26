import { AppState, ChatRoom, Message } from './interface';

export const initState: AppState = {
    activeRooms: [],
    maxRooms: 5,
    currentRoom: null,
    socket: null
}

export const ACTION = {
    ADD: {
        ROOM: 'Add a new accesible room',
        MESSAGE: 'Add a new message to the current room',
        SOCKET: 'Add a new socket'
    },
    CHANGE: {
        ROOM: 'Change the current room' 
    },
    DELETE: {
        ROOM: 'Remove a room'
    }
}

export class EventDispatcher {
    dispatch: Function;

    constructor (dispatch) {
        this.dispatch = dispatch;
    }

    public addRoom (room: ChatRoom): void {
        this.dispatch({ type: ACTION.ADD.ROOM, value: room });
    }

    public addSocket (socket): void {
        this.dispatch({ type: ACTION.ADD.SOCKET, value: socket });
    }

    public changeRoom (roomID: string): void {
        this.dispatch({ type: ACTION.CHANGE.ROOM, value: roomID });
    }
    
    public addMessage(message: string): void {
        this.dispatch({ type: ACTION.ADD.MESSAGE, value: message });
    }


}

export const Reducer = (state, action) => {
    console.log(`New event dispatched: ${action.type}`);

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
        case ACTION.ADD.ROOM:
            {
                const newRoom: ChatRoom = action.value;
                return {
                    ...state,
                    activeRooms: [...state.activeRooms, newRoom]
                }
            }
        
        case ACTION.ADD.SOCKET:
            {
                const socket = action.value;
                return {
                    ...state,
                    socket
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