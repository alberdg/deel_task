const validateGetBestClients = (req, res, next) => {
    try {
        let limit = parseInt(req.query.limit ?? 2, 10);
        if (isNaN(limit) || limit <= 0) {
            limit = 2;
        }
        req.queryValues = {
            ...req.dates,
            limit
        };
        next();
    } catch (err ) {
        console.error(`ValidateGetGestClients: Error validating input ${JSON.stringify(err)} ${err}`);
        return res.status(500).send({ success: false, error: err.message, bestClients: null });
    }
}

module.exports = { validateGetBestClients };