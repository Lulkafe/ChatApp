import generateIds from '../src/IdGenerator';

test('Generate IDs', () => {
    const numOfRooms = 10;
    const lenOfID = 5;
    const regx = /[A-Z|0-9]{5}/;
    const IDs = generateIds(numOfRooms, lenOfID);
    expect(IDs instanceof Array).toBe(true);
    expect(IDs.length).toBe(numOfRooms);

    for (const id of IDs) {
        expect(typeof id).toBe('string');
        expect(regx.test(id)).toBe(true);
    }
});

