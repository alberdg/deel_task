const { clientRepositoryInstance } = require('./client-repository/client-repository');

class ClientService {
    constructor (clientRepository) {
        if (ClientService.instance) {
            return ClientService.instance;
        }
        this.clientRepository = clientRepository;
        ClientService.instance = this;
    }

    async addBalance(clientId, amount) {
        return this.clientRepository.addBalance(clientId, amount);
    }

    async getBestClients(startDate, endDate, limit) {
        return this.clientRepository.getBestClients(startDate, endDate, limit);
    }
}
const clientServiceInstance = new ClientService(clientRepositoryInstance);
module.exports = { clientServiceInstance };