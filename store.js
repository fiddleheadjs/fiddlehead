if (process.env.NODE_ENV === 'production') {
    module.exports = require('./lib/store.production.js');
} else {
    module.exports = require('./lib/store.development.js');
}
