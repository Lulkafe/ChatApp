import generateIds from './IdGenerator';

interface chatRoom {
    createdOn: string,
    expiredIn: number,
    roomID: string
}

export class chatRoomHandler {
    private lifespan: number;
    private roomArray: chatRoom[];
    private roomDic: {};
    private roomMax: number;

    constructor (lifespan : number = 20) {
        this.lifespan = lifespan;
        this.roomArray = [];
        this.roomDic = {};
        this.roomMax = 10000;
    }
    
    public createNewRoom (): boolean {

        if (this.cannotCreateMoreRooms())
            return false;

        const newId = this.findValidId();
        let newRoom: chatRoom = {
            createdOn: new Date().toISOString(),
            expiredIn: this.lifespan,
            roomID: newId
        }

        this.roomArray.push(newRoom);
        this.roomDic[newId] = 0;
        
        return true;
    }

    private findValidId (): string {
        let newId = ''
        
        while (newId === '') {
            let newIdCandidates: string[] = generateIds(5);

            for (const idCandidate of newIdCandidates) {
                if (this.isThisIdUnique(idCandidate))
                    newId = idCandidate;
                    break;
            }
        }

        return newId;
    }

    public clearExpiredRooms (): void {
        
        for (let i = 0; i < this.roomArray.length; i++) {
            const room = this.roomArray[i];

            if (this.hasRoomExpired(room)) {
                delete this.roomDic[room.roomID];
                continue;
            }

            //When the execution reaches here,
            //There are no expired anymore at rooms[i or greater]

            if (i === 0)
                return;

            this.roomArray = this.roomArray.slice(i);
            break;
        }

    }

    private cannotCreateMoreRooms (): boolean {
        return this.roomArray.length === this.roomMax;
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
