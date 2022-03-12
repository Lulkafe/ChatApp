import { generateIds } from './IdGenerator';
import { ChatRoomInfo } from './interface';

export class ChatRoomHandler {
    private validMin: number;
    private roomArray: ChatRoomInfo[];
    private roomDic: {};
    private roomMax: number;
    private timerObj: NodeJS.Timer | null;
    private watchRooms: boolean;
    private watching: boolean;

    constructor () {
        this.validMin = 0.17;   //How long the room is valid
        this.roomArray = [];    //Keep rooms in FILO order
        this.roomDic = {};      //For quick access to a room
        this.roomMax = 30000;   //How many rooms this handler can have
        this.timerObj = null;   //For managing setInterval
        this.watchRooms = true; //For testing purpose. False: disable setInterval
        this.watching = false;  //i.e. setInterval event is running or not 
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

        if (this.watchRooms && !this.watching) {
            this.timerObj = setInterval(this.clearExpiredRooms.bind(this), 1000);
            this.timerObj.unref();
            this.watching = true;
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
        
        let roomCounter = 0;

        //Order of the rooms is FIFO, not random
        //This iterates until the last expired room
        for (let i = 0; i < this.roomArray.length; i++) {
            const room = this.roomArray[i];

            if (this.isRoomExpired(room)) {
                delete this.roomDic[room.id];
                roomCounter += 1;
                continue;
            } 

            break;
        }
        
        //If at least one room has expired, so remove it
        if (roomCounter !== 0)
            this.roomArray = this.roomArray.slice(roomCounter);
     
        if (this.noActiveRoom() && this.timerObj) {
            clearTimeout(this.timerObj);
            this.watching = false;
        }
    }

    private noActiveRoom (): boolean {
        return this.roomArray.length === 0;
    }

    private isThisIdUnique (id: string): boolean {        
        return !(id in this.roomDic);
    }

    private isRoomExpired (room: ChatRoomInfo) {
        const currentTime = new Date().getTime();
        const expiredTime = new Date(room.expiredOn).getTime();
    
        return (expiredTime - currentTime) <= 0;
    }
}
