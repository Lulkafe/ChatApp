import generateIds from '../src/IdGenerator';

test('Generate IDs', () => {
    const num = 100;
    const IDs = generateIds(num);
    expect(IDs instanceof Array).toBe(true);
    expect(IDs.length).toBe(num);

    for (const id of IDs) {
        expect(typeof id).toBe('string');
        expect(id.length).toBe(5);
    }

});