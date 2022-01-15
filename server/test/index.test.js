const request = require('supertest');
const server = require('../src/index');

afterAll(done => {
    server.close();
    done();
})

test('Get a room ID', (done) => {
    request(server).get('/')
        .expect(404)
        .end((err, res) => {
            done();
        });
});
