import { TIMEOUT } from 'dns';
import generateIds from './IdGenerator';
import { ChatRoomInfo } from './interface';

export class ChatRoomHandler {
    private validMin: number;
    private roomArray: ChatRoomInfo[];
    private roomDic: {};
    private roomMax: number;
    private timerObj: NodeJS.Timer | null;
    private watchRooms: boolean;

    constructor () {
        this.validMin = 60;   //How long the room is valid
        this.roomArray = [];  //Keep rooms in FILO order
        this.roomDic = {};    //For quick access to a room
        this.roomMax = 10000; 
        this.timerObj = null;  //For managing setInterval
        this.watchRooms = true; //
    }
    
    public createNewRoom (): ChatRoomInfo {

        const newId = this.findValidId();
        const currentTime = new Date();
        const expiredTime = new Date (currentTime.getTime() + (this.validMin * 60000));

        let newRoom: ChatRoomInfo = {
            createdOn: currentTime.toISOString(),
            expiredOn: expiredTime.toISOString(),
            id: newId
        }

        this.roomArray.push(newRoom);
        this.roomDic[newRoom.id] = newRoom;

        if (this.watchRooms) {
            this.timerObj = this.timerObj || 
             setInterval(this.clearExpiredRooms.bind(this), 1000);
            this.timerObj.unref();
        }
   
        return newRoom;
    }

    public _disableWatchRooms (): void {
        this.watchRooms = false;
    }

    public _enableWatchRooms (): void {
        this.watchRooms = true;
    }

    public _getMaxRooms (): number {
        return this.roomMax;
    }
    
    public canCreateNewRoom (): boolean {
        return this.roomArray.length < this.roomMax;
    }

    public doesThisRoomExist (roomId: string): boolean {
        return roomId in this.roomDic;
    }

    public fetchRoomInfo (roomId: string): ChatRoomInfo {
        return this.roomDic[roomId];
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

        if (this.watchRooms && this.noActiveRoom() && this.timerObj)
            clearTimeout(this.timerObj);
    }

    private noActiveRoom (): boolean {
        return this.roomArray.length === 0;
    }

    private isThisIdUnique (id: string): boolean {        
        return !(id in this.roomDic);
    }

    private hasRoomExpired (room: ChatRoomInfo) {
        const currentTime = new Date().getTime();
        const createdTime = new Date(room.createdOn).getTime();
    
        return (currentTime - createdTime) <= 0? true : false;
    }
}
