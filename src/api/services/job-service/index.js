const { getUserFromRequest } = require('../../utils');
const { jobRepositoryInstance } = require('./job-repository/job-repository');
class JobService {
    constructor(jobRepository) {
        if (JobService.instance) {
            return JobService.instance;
        }
        this.jobRepository = jobRepository;
        JobService.instance = this;
    }

    async getUnpaidJobs (req) {
        const userQuery = getUserFromRequest(req);
        return await this.jobRepository.getUnpaidJobs(userQuery);
    }
    
    async payForJob(jobId) {
        return await this.jobRepository.payForJob(jobId);
    }

    async getProfessionEarningMost(startDate, endDate) {
        return await this.jobRepository.getProfessionEarningMost(startDate, endDate);
    }
}

const jobServiceInstance = new JobService(jobRepositoryInstance);
module.exports={ jobServiceInstance }