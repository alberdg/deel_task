const { Contract } = require('../../../model');
class ContractRepository {
    constructor () {
        if (ContractRepository.instance) {
            return ContractRepository.instance;
        }
        ContractRepository.instance = this;
    }

    async getContractById (id, contractorId) {
        try {
            const contract = await Contract.findByPk(id);

            if (contract && contract.ContractorId !== contractorId) {
                return { success: false, error: 'The requested contract belongs to another contractor', contract: null };
            }
            return { success: true, error: null, contract };
        } catch (err) {
            console.error(`ContractRepository.getContractById: Error fetching contract (id: ${contractId}): ${JSON.stringify(err)} ${err}`);
            return { success: false, error: err.message, contract: null };
        }
    }

    /**
     * TODO: Pagination must be implemented in real world
     * but it is not done due to lack of time. It would receive a limit
     * and an offset. These two parameters would be added to the query in 
     * order to return the desired page
     */
    async getContracts (userQuery) {
        try {
            const contracts = await Contract.findAll({ where: userQuery });
            return { success: true, error: null, contracts };
        } catch (err) {
            return { success: false, error: err.message, contracts: [] };
        }
    }
}

const contractRepositoryInstance = new ContractRepository();
module.exports = { contractRepositoryInstance };