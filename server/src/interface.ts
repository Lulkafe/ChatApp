export interface ChatRoom {
    createdOn: string,
    expiredIn: number,
    id: string
}

export interface Message {
    text: string,
    userName: string,
    commentedOn: string 
}

export interface MessageFrame {
    message: Message,
    roomID: string
}