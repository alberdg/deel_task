const supertest = require('supertest');
const app = require('../../app');

const baseUrl = '/admin/best-profession';
describe('Get best profession tests', () => {
    it('Should not get best profession if profile is empty', async () => {
        const response = await supertest(app).get(baseUrl);
        expect(response.status).toEqual(401);
    });

    it('Should not get best profession if user is not an admin', async () => {
        const response = await supertest(app).get(baseUrl).set('profile_id', '6');
        expect(response.status).toEqual(403);
        expect(response.body).toStrictEqual({ success: false, error: 'Only admins can use this endpoint' });
    });

    it('Should fail if no dates are provided', async () => {
        const response = await supertest(app).get(baseUrl).set('profile_id', '1');
        expect(response.status).toEqual(400);
        expect(response.body).toStrictEqual({ success: false, error: 'Dates are missing' });
    })

    it('Should fail if no end date is provided', async () => {
        const response = await supertest(app).get(`${baseUrl}?start=2024-02-01`).set('profile_id', '1');
        expect(response.status).toEqual(400);
        expect(response.body).toStrictEqual({ success: false, error: 'Dates are missing' });
    })

    it('Should fail if no start date is provided', async () => {
        const response = await supertest(app).get(`${baseUrl}?end=2024-02-01`).set('profile_id', '1');
        expect(response.status).toEqual(400);
        expect(response.body).toStrictEqual({ success: false, error: 'Dates are missing' });
    })

    it('Should fail if start date is invalid', async () => {
        const response = await supertest(app).get(`${baseUrl}?start=abc&end=2024-02-01`).set('profile_id', '1');
        expect(response.status).toEqual(400);
        expect(response.body).toStrictEqual({ success: false, error: 'Invalid dates provided' });
    })

    it('Should fail if end date is invalid', async () => {
        const response = await supertest(app).get(`${baseUrl}?start=2024-02-01&end=abc2024-02-01`).set('profile_id', '1');
        expect(response.status).toEqual(400);
        expect(response.body).toStrictEqual({ success: false, error: 'Invalid dates provided' });
    })

    it('Should fail if both dates are invalid', async () => {
        const response = await supertest(app).get(`${baseUrl}?start=2024-02-011111&end=2024-02-12a`).set('profile_id', '1');
        expect(response.status).toEqual(400);
        expect(response.body).toStrictEqual({ success: false, error: 'Invalid dates provided' });
    })

    it('Should fail if start date is greater than end date', async () => {
        const response = await supertest(app).get(`${baseUrl}?start=2024-12-01&end=2024-02-12`).set('profile_id', '1');
        expect(response.status).toEqual(400);
        expect(response.body).toStrictEqual({ success: false, error: 'Invalid dates provided' });
    })

    it('Should get the best profession', async () => {
        const response = await supertest(app).get(`${baseUrl}?start=2020-01-01&end=2024-12-31`).set('profile_id', '1');
        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual({ success: true, error: null, topEarningProfession: 'Programmer' });
    })

    
});