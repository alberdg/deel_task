const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile')
const { jobServiceInstance } = require('./services/job-service');
const { clientServiceInstance } = require('./services/client-service');
const { validateAddBalance } = require('./middleware/validate-add-balance');
const { adminEndpoint } = require('./middleware/admin-endpoint');
const { validateGetBestClients } = require('./middleware/validate-get-best-clients');
const { validateDates } = require('./middleware/validate-dates');
const { contractServiceInstance } = require('./services/contract-service');
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.get('/contracts/:id', getProfile , async (req, res) =>{
    const { id } = req.params
    const contractorId = req.profile.get('id');
    const result = await contractServiceInstance.getContractById(id, contractorId);
    if(!result.contract) {
        return res.status(404).json({ success: false, error: 'Contract not found', contract: null });
    }
    return res.status(200).json(result);
});

app.get('/contracts', getProfile, async (req, res) => {
    const result = await contractServiceInstance.getContracts(req);
    return res.status(200).json(result);
});

app.get('/jobs/unpaid', getProfile, async (req, res) => {
    const response = await jobServiceInstance.getUnpaidJobs(req);
    return res.status(200).json(response);
});

app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    const result = await jobServiceInstance.payForJob(req.params.job_id);
    const status = result.success ? 200 : 400;
    return res.status(status).json(result);
});

app.post('/balances/deposit/:userId', getProfile, validateAddBalance, async (req, res) => {
    const result = await clientServiceInstance.addBalance(req.params.userId, req.body.amount)
    const status = result.success ? 200 : 400;
    return res.status(status).json(result);
});

app.get('/admin/best-profession', getProfile, adminEndpoint, validateDates, async (req, res) => {
    const { start, end } = req.dates;
    const result = await jobServiceInstance.getProfessionEarningMost(start, end);
    const status = result.success ? 200 : 400;
    return res.status(status).json(result);
});

app.get('/admin/best-clients', getProfile, adminEndpoint, validateDates, validateGetBestClients, async (req, res) => {
    const { start, end, limit } = req.queryValues;
    const result = await clientServiceInstance.getBestClients(start, end, limit);
    const status = result.success ? 200 : 400;
    return res.status(status).json(result);
});

app.get
module.exports = app;