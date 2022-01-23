export interface AppState {
    activeRooms: ChatRoom [],
    maxRooms: number,
    currentRoom: ChatRoom | null,
    socket
}

export interface ChatRoom {
    id: string,
    messages: Message [],
    createdOn: string,
    expiredOn: string
}

export interface Message {
    text: string,
    userName: string,
    commentedOn: string 
}

export interface MessageFrame {
    message: Message,
    roomId: string
}
