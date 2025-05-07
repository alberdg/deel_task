const getUserFromRequest = (req) => {
    const queryField = req.profile.type === 'contractor' ? 'ContractorId' : 'ClientId';
    const query = {};
    query[queryField] = req.profile.get('id');
    return query;
}
module.exports = { getUserFromRequest }