import { AppState, ChatRoom, Message } from './interface';

export const initState: AppState = {
    rooms: [],
    hostingRoomLimit: 2,
    currentRoom: null,
    socket: null,
    numOfHostingRooms: 0
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

    public changeRoom (roomId: string): void {
        this.dispatch({ type: ACTION.CHANGE.ROOM, value: roomId });
    }
    
    public addMessage(message: Message): void {
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
                const hostingRooms: number = state.numOfHostingRooms;

                return {
                    ...state,
                    rooms: [...state.rooms, newRoom],
                    numOfHostingRooms: newRoom.amIHost? 
                        hostingRooms + 1 : hostingRooms
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
                const expiredRoomId: string = action.value;
                if (!expiredRoomId) return state;

                let numOfHostingRooms: number = state.numOfHostingRooms;
                const rooms = state.rooms.map(room => {
                  
                    if (room.id == expiredRoomId) {
                        numOfHostingRooms--; 
                        return null;
                    } 

                    return room;
                }).filter(r => r);


                return {
                    ...state,
                    rooms,
                    numOfHostingRooms,
                    currentRoom: (expiredRoomId == state.currentRoom?.id)?
                        null : state.currentRoom
                }
            }
        
        default:
            return state;
    }
}