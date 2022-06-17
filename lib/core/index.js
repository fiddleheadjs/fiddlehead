if (process.env.NODE_ENV === 'production') {
    module.exports = require('./core.production.js');
} else {
    module.exports = require('./core.development.js');
}
