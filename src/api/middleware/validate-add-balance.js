const validateAddBalance = (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId);
        if (userId !== req.profile.get('id')) {
            return res.status(400).json({ success: false, error: 'You cannot update other client\'s balance', message: null });
        }
        const amount = parseFloat(req.body.amount);
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid payload, amount must be a number greater than 0', message: null });
        }
        req.body.amount = amount;
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json('There was an error processing the update balance request');
    }
}

module.exports = { validateAddBalance };