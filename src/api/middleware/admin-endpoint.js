const adminEndpoint = (req, res, next) => {
    const isAdmin = req.profile?.get('isAdmin');
    if (isAdmin !== true)  {
        return res.status(403).json({ success: false, error: 'Only admins can use this endpoint' });
    }
    next();
}

module.exports = { adminEndpoint };