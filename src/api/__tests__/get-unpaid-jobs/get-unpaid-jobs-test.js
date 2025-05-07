const supertest = require('supertest');
const app = require('../../app');
describe('Get all unpaid jobs tests', () => {
    it('Handles an empty request', async () => {
        const response = await supertest(app).get('/jobs/unpaid');
        expect(response.status).toEqual(401);
    });

    it('Handles a request for a non existing contractor or client', async () => {
        const response = await supertest(app).get('/jobs/unpaid').set('profile_id', '119');
        expect(response.status).toEqual(401);
    });

    it('Should return unpaid jobs for a contractor', async () => {
        const response = await supertest(app).get('/jobs/unpaid').set('profile_id', '7');
        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.length).toEqual(2);
        response.body.forEach(job => {
            expect(job.paid).toBeNull();
            expect(job.paymentDate).toBeNull();
        });
    });

    it('Should return unpaid jobs for a client', async () => {
        const response = await supertest(app).get('/jobs/unpaid').set('profile_id', '4');
        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.length).toEqual(1);
        response.body.forEach(job => {
            expect(job.paid).toBeNull();
            expect(job.paymentDate).toBeNull();
        });
    });
});