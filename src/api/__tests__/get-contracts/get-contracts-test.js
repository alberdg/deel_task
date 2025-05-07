const supertest = require('supertest');
const app = require('../../app');
describe('Get all contracts tests', () => {
    it('Handles an empty request', async () => {
        const response = await supertest(app).get('/contracts/3');
        expect(response.status).toEqual(401);
    });

    it('Handles a request for a non existing contractor or client', async () => {
        const response = await supertest(app).get('/contracts/3').set('profile_id', '119');
        expect(response.status).toEqual(401);
    });

    it('Does not return contracts from other contractors if profile_id is a contractor', async () => {
        const response = await supertest(app).get('/contracts').set('profile_id', '6');
        expect(response.status).toEqual(200);
        expect(response.body.success).toBeTruthy();
        expect(response.body.error).toBeNull();
        response.body.contracts.forEach(contract => {
          expect(contract.ContractorId).toEqual(6);
        });
    });

    it('Does not return contracts from other clients if profile_id is a client', async () => {
        const response = await supertest(app).get('/contracts').set('profile_id', '4');
        expect(response.status).toEqual(200);
        expect(response.body.success).toBeTruthy();
        expect(response.body.error).toBeNull();
        response.body.contracts.forEach(contract => {
          expect(contract.ClientId).toEqual(4);
        });
    });
});