import generateIds from './IdGenerator';
import { ChatRoom } from './interface';

export class ChatRoomHandler {
    private validMin: number;
    private roomArray: ChatRoom[];
    private roomDic: {};
    private roomMax: number;
    private intervalId: number;
    private debug: boolean;

    constructor () {
        this.validMin = 20;   //How long the room is valid
        this.roomArray = [];  //Keep rooms in FILO order
        this.roomDic = {};    //For quick access to a room
        this.roomMax = 10000; 
        this.intervalId = 0;  //For managing setInterval
        this.debug = false;
    }
    
    public createNewRoom (): ChatRoom {

        const newId = this.findValidId();
        let newRoom: ChatRoom = {
            createdOn: new Date().toISOString(),
            expiredIn: this.validMin,
            id: newId
        }
   
        return newRoom;
    }

    private watchNewRoom (room: ChatRoom): void {
       
        if (this.noActiveRoom()) 
            this.intervalId = window.setInterval(this.clearExpiredRooms, 1000);

        this.roomArray.push(room);
        this.roomDic[room.id] = 0;
    }
    
    public canCreateNewRoom (): boolean {
        return this.roomArray.length <= this.roomMax;
    }

    public doesThisRoomExist (roomID: string): boolean {
        return roomID in this.roomDic;
    }

    private findValidId (): string {
        const maxAttempts = 100;
        const numOfIds = 5;
        
        for (let i = 0; i < maxAttempts; i++) {
            let newIdCandidates: string[] = generateIds(numOfIds);

            for (const idCandidate of newIdCandidates) {
                if (this.isThisIdUnique(idCandidate))
                    return idCandidate;
            }
        }

        throw new Error(`Could not find a valid room ID`);
    }

    private clearExpiredRooms (): void {
        
        for (let i = 0; i < this.roomArray.length; i++) {
            const room = this.roomArray[i];

            if (this.hasRoomExpired(room)) {
                delete this.roomDic[room.id];
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

    private hasRoomExpired (room: ChatRoom) {
        const currentTime = new Date().getTime();
        const createdTime = new Date(room.createdOn).getTime();
        const lifespan = 1000 * 60 * room.expiredIn; 
    
        return (currentTime - createdTime) > lifespan? true : false;
    }
}
