//At server side, user messages are not stored
//so, messages array doesn't exist
export interface ChatRoom {
    createdOn: string,
    expiredOn: string,
    id: string
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