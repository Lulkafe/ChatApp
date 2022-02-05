export function getTimeDiff (startIsoTime: string, endIsoTime: string) {
    const diff = new Date(endIsoTime).getTime() - new Date(startIsoTime).getTime();
}

function convertTimeIntoMinSec (time: number) {
    const min = Math.floor(time / 1000);
    const sec = Math.floor((time / 1000) - (min * 60));
    return { min, sec };
}