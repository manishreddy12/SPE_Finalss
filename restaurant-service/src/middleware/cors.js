const cors = require('cors');
const constants = require('../config/constants');

const corsMiddleware = cors(constants.corsOptions);

module.exports = corsMiddleware;
