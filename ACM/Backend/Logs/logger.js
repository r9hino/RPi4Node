const {config, createLogger, format, transports} = require('winston');

const options = {
    error: {
        level: 'error',
        filename: './Logs/error.log',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: true,
    },
    warning: {
        level: 'warn',
        filename: './Logs/warning.log',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: true,
    },
    info: {
        level: 'info',
        filename: './Logs/info.log',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: true,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const logger = createLogger({
    levels: config.npm.levels,
    format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
        new transports.File(options.error),
        new transports.File(options.warning),
        new transports.File(options.info),
        new transports.Console(options.console)
    ],
    //exitOnError: false
  });
  
  module.exports = logger;