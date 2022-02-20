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
    return _getTimeDiff(chatRoom.expiredOn, chatRoom.createdOn) <= 0;
}

function _getTimeDiff(startISOTime: string, endISOTime: string): number {
    return new Date(startISOTime).getTime() - new Date(endISOTime).getTime();
}