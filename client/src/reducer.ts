import { AppState, ChatRoom, Message } from './interface';

export const initState: AppState = {
    rooms: [],
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
        ROOM: 'Change the current room',
        PARTICIPANT: 'Change the number of participants'
    },
    EXPIRE: {
        ROOM: 'A room has expired'
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

    public deleteRoom (room: ChatRoom): void {
        this.dispatch({ type: ACTION.DELETE.ROOM, value: room });
    }

    public addSocket (socket): void {
        this.dispatch({ type: ACTION.ADD.SOCKET, value: socket });
    }

    public changeRoom (roomId: string): void {
        this.dispatch({ type: ACTION.CHANGE.ROOM, value: roomId });
    }
    
    public addMessage(message: string): void {
        this.dispatch({ type: ACTION.ADD.MESSAGE, value: message });
    }

    public updateRoomParticipant(num: number): void {
        this.dispatch({ type: ACTION.CHANGE.PARTICIPANT, value: num});
    }

    public expireRoom(roomId: string): void {
        console.log(`Room ${roomId} has expired`);
        this.dispatch({ type: ACTION.EXPIRE.ROOM, value: roomId });
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
                    rooms: state.rooms.map(room => {
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
                    rooms: [...state.rooms, newRoom]
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
                const room: ChatRoom = 
                    state.rooms.find(room => room.id == roomID);

                if (!room)
                    return state;

                return {
                    ...state, 
                    currentRoom: room
                }
            }
        
        case ACTION.CHANGE.PARTICIPANT:
            {
                const participant = action.value;
                if (!participant) return state;
                
                return {
                    ...state,
                    currentRoom: {
                        ...state.currentRoom,
                        participant
                    }
                }
            }
        
        case ACTION.EXPIRE.ROOM:
            {
                const expiredRoomId = action.value;
                if (!expiredRoomId) return state;

                return {
                    ...state,
                    rooms: state.rooms.map(room => {
                        return room.id == expiredRoomId? null : room;
                    }).filter(r => r),
                    currentRoom: (expiredRoomId == state.currentRoom?.id)?
                        null : state.currentRoom
                }
            }
            
            return state;
        
        default:
            return state;
    }
}