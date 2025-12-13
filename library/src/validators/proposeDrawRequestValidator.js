function validateProposeDrawRequest(request) {
    const allowedKeys = ['type', 'color'];
    const requestKeys = Object.keys(request);
    if (requestKeys.length !== 2 || !requestKeys.every(key => allowedKeys.includes(key))) {
        return {
            valid: false,
            error: 'Propose draw request must include type and color and nothing else'
        };
    }
    const { color } = request;
    if (typeof color !== 'string') {
        return {
            valid: false,
            error: 'Color must be a string'
        };
    }
    if (!['white', 'black'].includes(color)) {
        return {
            valid: false,
            error: `Invalid color: ${color}. Must be "white" or "black"`
        };
    }
    return { valid: true };
}

module.exports = validateProposeDrawRequest;

