import { ChatRoom } from './interface';

export function calcTimeDiff (startISOTime: string, endISOTime: string) {
    const diff = new Date(endISOTime).getTime() - new Date(startISOTime).getTime();
    const seconds = diff / 1000;
    const minDiff = Math.floor(seconds / 60);
    const secDiff = Math.floor(seconds - (minDiff * 60));
    return { min: minDiff, sec: secDiff };
}

export function hasRoomExpired (room: ChatRoom): boolean {
    const timeLeft = calcTimeDiff(room.createdOn, room.expiredOn);
    return timeLeft.min <= 0 && timeLeft.sec <= 0;
}