const winston = require('winston');
const cfg = require('../config/config').logger;

const _logger = new winston.Logger({
    levels: {
        audit: 0,
        error: 1,
        warning: 2,
        info: 3,
        debug: 4
    },
    colors: {
        audit: 'magenta',
        input: 'grey',
        verbose: 'cyan',
        prompt: 'grey',
        debug: 'blue',
        info: 'green',
        data: 'grey',
        help: 'cyan',
        warning: 'yellow',
        error: 'red'
    }
});

_logger.add(winston.transports.Console, {
    level: cfg.level,
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: false
});

module.exports = _logger;
