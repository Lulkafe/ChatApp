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
    expiredOn: string,
    participant: number
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
