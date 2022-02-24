import { ChatRoom } from './interface';

export function calcTimeDiff (startISOTime: string, endISOTime: string, zeroIfOvertime: boolean = true) {
    const diff = _getTimeDiff(endISOTime, startISOTime);
    const isOvertime = (diff <= 0);

    if (zeroIfOvertime && isOvertime)
        return { min: 0, sec: 0};

    const seconds = diff / 1000;
    const minDiff = Math.floor(seconds / 60);
    const secDiff = Math.floor(seconds - (minDiff * 60));

    return { min: minDiff, sec: secDiff };
}

export function hasRoomExpired (chatRoom: ChatRoom): boolean {
    const currentTime = new Date().getTime();
    const expiredTime = new Date(chatRoom.expiredOn).getTime();
    return (expiredTime - currentTime) <= 0;
}

function _getTimeDiff(ISOTime1: string, ISOTime2: string): number {
    return new Date(ISOTime1).getTime() - new Date(ISOTime2).getTime();
}