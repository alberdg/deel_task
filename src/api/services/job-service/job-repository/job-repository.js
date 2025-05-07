const { Op } = require('sequelize');
const { sequelize, Job, Contract, Profile } = require('../../../model');
class JobRepository {
    constructor() {
        if (JobRepository.instance) {
            return JobRepository.instance;
        }
        JobRepository.instance = this;
    }


    async getUnpaidJobs (userQuery) {
        return await Job.findAll({
            include: {
                model: Contract,
                where: {
                    ...userQuery,
                    status: 'in_progress'
                },
            },
            where: {
                paid: null
            }
        });
    }

    async payForJob(jobId) {
        const transaction = await sequelize.transaction();

        /**
         * I am assuming a job can be paid even if it is not in terminated status
         * If that is not the case there are 2 ways to prevent this:
         * 1. add , status: 'terminated' to the where clause -> This will give us job not found
         * 2. After the !job condition add a new condition checking for job.status !== terminated and
         * throw a new error saying only terminated jobs can be paid
         */
        try {
            const job = await Job.findOne({
                where: { id: jobId },
                include: {
                    model: Contract,
                    include: [
                        { model: Profile, as: 'Client' },
                        { model: Profile, as: 'Contractor' }
                    ]
                },
                transaction
            });

            if (!job) {
                throw new Error(`Job: ${jobId} not found`);
            }

            if (job.paid) {
                throw new Error(`You can't pay for the job (id: ${jobId}) twice`);
            }
            const { Client, Contractor } = job.Contract;

            if (Client.balance < job.price) {
                throw new Error('The client balance is not sufficient to pay the job');
            }

            Client.balance -= job.price;
            Contractor.balance += job.price;

            // Set job paid and payment date
            job.paid = true;
            job.paymentDate = new Date().toISOString();

            await Client.save({ transaction });
            await Contractor.save({ transaction });
            await job.save({ transaction });

            // Commit the transaction
            await transaction.commit();

            return { success: true, message: 'Job successfully paid', error: null };
        } catch (err) {
            console.error(`JobRepository.payForJob: Error pay for job (${jobId}): ${JSON.stringify(err)} ${err}`);
            // Rollback the transaction
            await transaction.rollback();

            return { success: false, message: null, error: err.message };
        }
    }

    async getProfessionEarningMost (startDate, endDate) {
        try {
            const { Job, Contract, Profile } = require('../../../model');
            const jobs = await Job.findAll({
                where: {
                    paid: true,
                    paymentDate: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                include: {
                    model: Contract,
                    include: {
                        model: Profile,
                        as: 'Contractor'
                    }
                }
            });
    
            const aggregatedEarnings = jobs.reduce((agg, job) => {
                const profession = job.Contract.Contractor.profession;
                const earnings = parseFloat(job.price);
    
                if (!agg[profession]) {
                    agg[profession] = 0;
                }
                agg[profession] += earnings;
    
                return agg;
            }, {});
    
            
            let topEarningProfession = null;
            let maxEarnings = 0;
    
            for (const profession in aggregatedEarnings) {
                if (aggregatedEarnings[profession] > maxEarnings) {
                    topEarningProfession = profession;
                    maxEarnings = aggregatedEarnings[profession];
                }
            }
    
            return { success: true, error: null, topEarningProfession }
    
        } catch (err) {
            console.error(`JobRepository.getProfessionEarningMost: Error fetching top earning profession: ${JSON.stringify(err)} ${err}`);
            return { success: false, error: err.message, topEarningProfession: null }
        }
    }
}

const jobRepositoryInstance = new JobRepository();
module.exports = { jobRepositoryInstance }