const getTokenFromHeader = (req) => {

    const authHeader = req.headers['authorization']; // or req.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1]; // Extracts the token after 'Bearer'
    }
}

module.exports = getTokenFromHeader;