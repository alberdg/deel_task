const supertest = require('supertest');
const app = require('../../app');
const { setClientBalance, setJobPaid } = require('../utils');

describe('Pay for job tests', () => {
    /**
     * Note: If jobs can only be paid when terminated we would need to add 
     * another test case which goes through each of the statuses to make sure
     * only terminated jobs can be paid
     */
    
    it('Should handle a non existing job', async () => {
        const response = await supertest(app).get('/jobs/119/pay');
        expect(response.status).toEqual(404);
    });

    it('Should not allow a client to pay a job if has not enough balance', async () => {
        const jobId = 1;
        const clientId = 1;
        await Promise.all[setClientBalance(10, clientId), setJobPaid(false, jobId)];
        const response = await supertest(app).post(`/jobs/${jobId}/pay`).set('profile_id', clientId);
        expect(response.status).toEqual(400);
        expect(response.body?.success).toBeFalsy();
        expect(response.body?.error).toEqual('The client balance is not sufficient to pay the job');
        expect(response.body?.message).toBeNull();
        await setClientBalance(1150, clientId); // We want to keep jobId 1 paid as null for next tests

    });

    it('Should not allow a client to pay a job more than once', async () => {
        const jobId = 1;
        const clientId = 1;
        await setJobPaid(true, jobId);
        const response = await supertest(app).post(`/jobs/${jobId}/pay`).set('profile_id', clientId);
        expect(response.status).toEqual(400);
        expect(response.body?.success).toBeFalsy();
        expect(response.body?.error).toEqual(`You can't pay for the job (id: ${jobId}) twice`);
        expect(response.body?.message).toBeNull();
    });

    it('Should allow a client to pay a job if has enough balance', async () => {
        const jobId = 1;
        const clientId = 1;
        await Promise.all[setClientBalance(1150, clientId), setJobPaid(null, jobId)];
        const response = await supertest(app).post(`/jobs/${jobId}/pay`).set('profile_id', clientId);
        expect(response.status).toEqual(200);
        expect(response.body?.success).toBeTruthy();
        expect(response.body?.error).toBeNull();
        expect(response.body?.message).toEqual('Job successfully paid');
        await setJobPaid(null, jobId); // Leave it as it was so other tests pass
    });
})