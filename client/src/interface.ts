export interface AppState {
    rooms: ChatRoom [],
    hostingRoomLimit: number,
    currentRoom: ChatRoom | null,
    socket: any,
    numOfHostingRooms: number
}

export interface ChatRoom {
    //Given by Server
    id: string,
    createdOn: string,
    expiredOn: string,
    participant: number, 
    
    //Used only by client side
    messages: Message [],
    amIHost: boolean  
}

export interface Message {
    text: string,
    userName: string,
    commentedOn: string,
    isMyComment: boolean
}

export interface MessageFrame {
    message: Message,
    roomId: string
}

export interface TimerEvent {
    minute: number,
    second: number,
    callback: Function
}