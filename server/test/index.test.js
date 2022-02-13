const request = require('supertest');
const server = require('../src/index');
let newRoomId = ''

afterAll(done => {
    server.close();
    done();
})

test('Get a new room object', done => {
    request(server).get('/api/room/new')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            expect(err).toBe(null);

            const result = res.body;

            expect('id' in result).toBe(true);
            expect('createdOn' in result).toBe(true);
            expect('expiredOn' in result).toBe(true);

            newRoomId = result.id;
            
            done();
        });
});


test('Check if the new room exists', done => {
    expect(newRoomId).not.toBe('');

    request(server).post('/api/room/check')
    .expect(200)
    .expect('Content-Type', /json/)
    .send({ roomId: newRoomId })
    .end((err, res) => {

        expect(err).toBe(null);

        const result = res.body;

        expect('room' in result).toBe(true);
    
        done();
    });
})