const request = require('supertest');
const server = require('../src/index');

afterAll(done => {
    server.close();
    done();
})

test('Get a new room object', (done) => {
    request(server).get('/api/room/new')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {

            if (err) {
                fail();
                done();
            }

            const result = res.body;

            if ('error' in result) {
                fail();
                done();
            }

            expect('id' in result).toBe(true);
            expect('createdOn' in result).toBe(true);
            expect('expiredIn' in result).toBe(true);
            done();
        });
});
