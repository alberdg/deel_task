const { Op } = require('sequelize');
const { sequelize, Profile, Job, Contract } = require('../../../model');
class ClientRepository {
    constructor () {
        if (ClientRepository.instance) {
            return ClientRepository.instance;
        }
        ClientRepository.instance = this;
    }

    async addBalance(clientId, amount) {
        const transaction = await sequelize.transaction();

        try {
            const client = await Profile.findByPk(clientId, { transaction });

            if (!client) {
                throw new Error(`Client ${clientId} not found`);
            }

            if (client.type !== 'client') {
                throw new Error(`Client ${clientId} is not allowed to top up balance`)
            }

            // Fetch all jobs under client's contracts which are unpaid
            const jobs = await Job.findAll({
                include: {
                    model: Contract,
                    where: { ClientId: clientId },
                    attributes: []
                },
                where: { paid: null },
                attributes: [ 'price' ],
                transaction
            });


            const totalToBePaid = jobs.reduce((total, job) => total + parseFloat(job.price), 0);
            const maxBalanceToDeposit = totalToBePaid * 0.25;
            if (amount > maxBalanceToDeposit) {
                throw new Error(`The amount exceeds the allowed limit of ${maxBalanceToDeposit.toFixed(2)}`);
            }

            client.balance += amount;
            await client.save({ transaction });

            await transaction.commit();

            return { success: true, message: 'Amount successfully added to balance', error: null, newBalance: client.balance };
        } catch (err) {
            console.error(`ClientRepository.addBalance: Error adding balance for client (id: ${clientId}): ${JSON.stringify(err)} ${err}`);
            await transaction.rollback();

            return { success: false, error: err.message, message: null };
        }
    }

    /**
     * TODO: Pagination must be implemented in real world
     * but it is not done due to lack of time. It would receive an extra offset parameter. 
     * It would be added to the query in order to return the desired page
     */
    async getBestClients(startDate, endDate, limit) {
        try {
            const results = await Profile.findAll({
                attributes: [
                    'id',
                    [sequelize.fn('concat', sequelize.col('firstName'), ' ', sequelize.col('lastName')), 'fullName'],
                    [sequelize.fn('SUM', sequelize.col('Client->Jobs.price')), 'paid']
                ],
                include: [
                    {
                        model: Contract,
                        as: 'Client',
                        attributes: [],
                        include: [
                            {
                                model: Job,
                                attributes: [],
                                where: {
                                    paid: true,
                                    paymentDate: {
                                        [Op.between]: [startDate, endDate]
                                    }
                                }
                            }
                        ]
                    }
                ],
                group: ['Profile.id'],
                order: [[sequelize.literal('paid'), 'DESC']],
                limit,
                subQuery: false
            });
        
            const bestClients = results.map(client => ({
                id: client.id,
                fullName: client.get('fullName'),
                paid: parseFloat(client.get('paid') ?? 0)
            }));
            return { success: true, error: null, bestClients };
        } catch (err) {
            console.error(`ClientRepository.getBestClients: Error getting best clients: ${JSON.stringify(err)} ${err}`);
            return { success: false, error: err.message, bestClients: null };
        }
    }
}

const clientRepositoryInstance = new ClientRepository();
module.exports = { clientRepositoryInstance };