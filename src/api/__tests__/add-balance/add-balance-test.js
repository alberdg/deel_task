const supertest = require('supertest');
const app = require('../../app');
const { setClientBalance } = require('../utils');

describe('Add balance tests', () => {
    it('Should fail if client does not exist', async () => {
        const response = await supertest(app).post('/balances/deposit/119').set('profile_id', '119');
        expect(response.status).toEqual(401);
    });

    it('Should fail if userId is a contractor', async () => {
        const response = await supertest(app).post('/balances/deposit/6').send({ amount: 0.1 }).set('profile_id', '6');
        expect(response.status).toEqual(400);
        expect(response.body?.success).toBeFalsy();
        expect(response.body?.error).toEqual('Client 6 is not allowed to top up balance');
        expect(response.body?.message).toBeNull();
    })

    it('Should fail if client is topping up balance for another client', async () => {
        const response = await supertest(app).post('/balances/deposit/1').send({ amount: 0.1 }).set('profile_id', '2');
        expect(response.status).toEqual(400);
        expect(response.body?.success).toBeFalsy();
        expect(response.body?.error).toEqual('You cannot update other client\'s balance');
        expect(response.body?.message).toBeNull();
    })


    it('Should fail if no amount provided', async () => {
        const response = await supertest(app).post('/balances/deposit/1').send({}).set('profile_id', '1');
        expect(response.status).toEqual(400);
        expect(response.body?.success).toBeFalsy();
        expect(response.body?.error).toEqual('Invalid payload, amount must be a number greater than 0');
        expect(response.body?.message).toBeNull();
    });

    it('Should fail if no numeric amount provided', async () => {
        const response = await supertest(app).post('/balances/deposit/1').send({ amount: null }).set('profile_id', '1');
        expect(response.status).toEqual(400);
        expect(response.body?.success).toBeFalsy();
        expect(response.body?.error).toEqual('Invalid payload, amount must be a number greater than 0');
        expect(response.body?.message).toBeNull();
    });

    it('Should fail if negative amount provided', async () => {
        const response = await supertest(app).post('/balances/deposit/1').send({ amount: -1 }).set('profile_id', '1');
        expect(response.status).toEqual(400);
        expect(response.body?.success).toBeFalsy();
        expect(response.body?.error).toEqual('Invalid payload, amount must be a number greater than 0');
        expect(response.body?.message).toBeNull();
    });

    it('Should fail if amount provided is greater than 25% of total jobs price sum', async () => {
        const response = await supertest(app).post('/balances/deposit/1').send({ amount: 200 }).set('profile_id', '1');
        expect(response.status).toEqual(400);
        expect(response.body?.success).toBeFalsy();
        expect(response.body?.error).toEqual('The amount exceeds the allowed limit of 100.25');
        expect(response.body?.message).toBeNull();
    });

    it('Should add balance if amount provided is up to 25% of total jobs price sum', async () => {
        await setClientBalance(1150, 1);
        const response = await supertest(app).post('/balances/deposit/1').send({ amount: 100.25 }).set('profile_id', '1');
        expect(response.status).toEqual(200);
        expect(response.body?.success).toBeTruthy();
        expect(response.body?.error).toBeNull();
        expect(response.body?.message).toEqual('Amount successfully added to balance');
        expect(response.body?.newBalance).toEqual(1250.25);
    });
});