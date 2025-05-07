const supertest = require('supertest');
const app = require('../../app');
describe('Contract by id tests', () => {
    it('Handles an empty request', async () => {
        const response = await supertest(app).get('/contracts/3');
        expect(response.status).toEqual(401);
    });

    it('Handles a request for a non existing contractor', async () => {
        const response = await supertest(app).get('/contracts/3').set('profile_id', '119');
        expect(response.status).toEqual(401);
    });

    it('Does not return contracts from other contractors', async () => {
        const response = await supertest(app).get('/contracts/1').set('profile_id', '6');
        expect(response.status).toEqual(404);
        expect(response.body).toStrictEqual({
            success: false,
            error: 'Contract not found',
            contract: null
        });
    });

    it('Does return contracts for the current contractor', async () => {
        const response = await supertest(app).get('/contracts/3').set('profile_id', '6');
        expect(response.status).toEqual(200);
        expect(response.body.success).toBeTruthy();
        expect(response.body.error).toBeNull();
        expect(response.body.contract.ContractorId).toEqual(6);
    });

    it('Handles a non existing contract', async () => {
        const response = await supertest(app).get('/contracts/119').set('profile_id', '6');
        expect(response.status).toEqual(404);
    });
});