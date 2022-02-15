export function calcTimeDiff (startISOTime: string, endISOTime: string) {
    const diff = new Date(endISOTime).getTime() - new Date(startISOTime).getTime();
    const seconds = diff / 1000;
    const minDiff = Math.floor(seconds / 60);
    const secDiff = Math.floor(seconds - (minDiff * 60));
    return { min: minDiff, sec: secDiff };
}

