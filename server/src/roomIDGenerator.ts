const charTable = (() => {
    let ary: string[] = [];
    
    for (let i = 0; i <= 9; i++)
    ary.push(i.toString());
    
    for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++)
    ary.push(String.fromCharCode(i));
    
    return ary;
})()

export default function generateRoomID (IdStrLen: number = 4, numOfID: number = 1): string | string[] {
	const chars: string[] = charTable;
    const _generateId = () => {
        let id: string = ''
        for (let i = 0; i < IdStrLen; i++) {
            const randomIdx = Math.floor(Math.random() * chars.length)
            id += chars[randomIdx];
        }
        return id;
    }
    
    if (numOfID === 1) 
        return _generateId();
    else {
        let ids: string[] = [];
        for (let i = 0; i < numOfID; i++)
            ids.push(_generateId())
        return ids;
    } 

}