const { Profile, Job } = require('../model');
const setClientBalance = async (balance, clientId) => {
    const [updatedRowsCount] = await Profile.update(
        { balance },
        { where: { id: clientId } }
    );

    if (updatedRowsCount === 0) {
        throw new Error('Balance was not updated');
    }
}

const setJobPaid = async (paid, jobId) => {
    const paymentDate = paid ? new Date().toISOString() : null;
    const [updatedRowsCount] = await Job.update(
        { paid: paid ?? null, paymentDate },
        { where: { id: jobId } }
    );

    if (updatedRowsCount === 0) {
        throw new Error('Job was not updated');
    }
}

module.exports = { setClientBalance, setJobPaid };