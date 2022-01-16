// ID Generator
// This module generates a random ID composed of numbers and alphabets: [0-9|A-Z]  
// By default, it can generate 36^4 (= 1,679,616) patterns: e.g. 9K8A

const charTable = (() => {
    let ary: string[] = [];
    
    for (let i = 0; i <= 9; i++)
    ary.push(i.toString());
    
    for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++)
    ary.push(String.fromCharCode(i));
    
    return ary;
})()

export default function generateIds (numOfID: number = 1, IdStrLen: number = 4): string[] {
	const chars: string[] = charTable;
    const _generateId = () => {
        let id: string = ''
        for (let i = 0; i < IdStrLen; i++) {
            const randomIdx = Math.floor(Math.random() * chars.length)
            id += chars[randomIdx];
        }
        return id;
    }
    
    let ids: string[] = [];
    for (let i = 0; i < numOfID; i++)
        ids.push(_generateId())
    return ids;
}