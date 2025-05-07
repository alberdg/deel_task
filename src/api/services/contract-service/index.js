const { getUserFromRequest } = require('../../utils');
const { contractRepositoryInstance } = require('./contract-repository/contract-repository');

class ContractService {
    constructor (contractRepository) {
        if (ContractService.instance) {
            return ContractService.instance;
        }
        this.contractRepository = contractRepository;
        ContractService.instance = this;
    }

    async getContractById (id, contractorId) {
        return this.contractRepository.getContractById(id, contractorId);
    }

    async getContracts (req) {
        const userQuery = getUserFromRequest(req);
        return this.contractRepository.getContracts(userQuery);
    }
}
const contractServiceInstance = new ContractService(contractRepositoryInstance);
module.exports = { contractServiceInstance };