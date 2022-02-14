export function calcTimeDiff (startIsoTime: string, endIsoTime: string) {
    const diff = new Date(endIsoTime).getTime() - new Date(startIsoTime).getTime();
    const seconds = diff / 1000;
    const minDiff = Math.floor(seconds / 60);
    const secDiff = Math.floor(seconds - (minDiff * 60));
    return { min: minDiff, sec: secDiff };
}

export function getCurrentTime (): string {
    return new Date().toISOString();
}