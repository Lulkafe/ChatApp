import generateIds from './IdGenerator';

export interface chatRoom {
    createdOn: string,
    expiredIn: number,
    roomID: string
}

export class ChatRoomHandler {
    private validMin: number;
    private roomArray: chatRoom[];
    private roomDic: {};
    private roomMax: number;
    private intervalId: number;

    constructor (validMin : number = 20) {
        this.validMin = validMin;
        this.roomArray = [];
        this.roomDic = {};
        this.roomMax = 10000;
        this.intervalId = 0;
    }
    
    public createNewRoom (): chatRoom {

        const newId = this.findValidId();
        let newRoom: chatRoom = {
            createdOn: new Date().toISOString(),
            expiredIn: this.validMin,
            roomID: newId
        }

        //Start watching rooms if there are any
        if (this.noActiveRoom()) 
            this.intervalId = window.setInterval(this.clearExpiredRooms, 1000);

        this.roomArray.push(newRoom);
        this.roomDic[newId] = 0;
            
        return newRoom;
    }
    
    public canCreateNewRoom (): boolean {
        return this.roomArray.length <= this.roomMax;
    }

    private findValidId (): string {
        let newId = ''
        let attempt = 0;
        const ATN_MAX = 10;
        const QTY = 5;
        
        while (newId === '' && attempt < ATN_MAX) {
            let newIdCandidates: string[] = generateIds(QTY);

            for (const idCandidate of newIdCandidates) {
                if (this.isThisIdUnique(idCandidate))
                    newId = idCandidate;
                    break;
            }

            attempt += 1;
        }

        if (attempt > ATN_MAX)
            throw new Error(`Could not find a valid room ID within ${attempt} time attempts`)

        return newId;
    }

    private clearExpiredRooms (): void {
        
        for (let i = 0; i < this.roomArray.length; i++) {
            const room = this.roomArray[i];

            if (this.hasRoomExpired(room)) {
                delete this.roomDic[room.roomID];
                continue;
            }

            //No room hasn't expired yet
            //This is guarantted because a new room is always pushed to an array
            //So, Smaller index == Ealier Timp stamp
            if (i === 0)  
                break;

            //If the execution reaches here, at least one room has expired
            this.roomArray = this.roomArray.slice(i);
            break;
        }

        //No active room so No need to watch rooms
        if (this.noActiveRoom())
            window.clearTimeout(this.intervalId);
    }

    private noActiveRoom (): boolean {
        return this.roomArray.length === 0;
    }

    private isThisIdUnique (id: string): boolean {        
        return !(id in this.roomDic);
    }

    private hasRoomExpired (room: chatRoom) {
        const currentTime = new Date().getTime();
        const createdTime = new Date(room.createdOn).getTime();
        const lifespan = 1000 * 60 * room.expiredIn; 
    
        return (currentTime - createdTime) > lifespan? true : false;
    }
}
