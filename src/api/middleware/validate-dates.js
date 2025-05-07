const dayjs = require('dayjs');

const validateDates = (req, res, next) => {
    if (!req.query.start || !req.query.end) {
        return res.status(400).json({ success: false, error: 'Dates are missing' });
    }
    const start = dayjs(req.query.start);
    const end = dayjs(req.query.end);

    if (!start.isValid() || !end.isValid() || start.diff(end, 'second') > 0) {
        return res.status(400).json({ success: false, error: 'Invalid dates provided' });
    }
    req.dates = {
        start: start.toISOString(),
        end: end.toISOString(),
    }
    next();
}

module.exports = { validateDates };