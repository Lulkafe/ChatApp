import generateIds from '../src/IdGenerator';

test('Generate IDs (Default: 5 letters)', () => {
    const num = 10;
    const regx = /[A-Z|0-9]{5}/;
    const IDs = generateIds(num);
    expect(IDs instanceof Array).toBe(true);
    expect(IDs.length).toBe(num);

    for (const id of IDs) {
        expect(typeof id).toBe('string');
        expect(regx.test(id)).toBe(true);
    }
});

