import { ChatRoomHandler } from '../src/chatRoomHandler';

const handler = new ChatRoomHandler();
handler._disableWatchRooms();

let generatedRooms = [];
const roomLimit = handler._getMaxRooms();

test('Create Rooms up to maximum', () => {
    for (let i = 0; i < roomLimit; i++) {
        const newRoom = handler.createNewRoom();
        expect(typeof newRoom.id).toBe('string');
        expect(typeof newRoom.expiredOn).toBe('string');
        expect(typeof newRoom.createdOn).toBe('string');
        generatedRooms.push(newRoom);
    }
})

test('Check if no more room can be created', () => {
    expect(handler.canCreateNewRoom()).toBe(false);
})

test('Check if generated rooms really stored in the handler', () => {
    for (let i = 0; i < roomLimit; i++) {
        const room = generatedRooms[i];
        expect(handler.doesThisRoomExist(room.id)).toBe(true);
    }
}) 