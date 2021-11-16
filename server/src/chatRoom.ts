export interface Room {
    createdOn: string,
    expiredIn: number,
    roomID: string
}

export function createNewRoom (roomId: string) {

    return false;
}

export function clearExpiredRooms () {
   
}

export function didRoomExpire (room: Room) {
    const currentTime = new Date().getTime();
    const createdTime = new Date(room.createdOn).getTime();
    const lifespan = 1000 * 60 * room.expiredIn; //expiration represents minutes

    return (currentTime - createdTime) > lifespan? true : false;
}