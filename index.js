if (process.env.NODE_ENV === 'production') {
    module.exports = require('./lib/core.production.js');
} else {
    module.exports = require('./lib/core.development.js');
}
