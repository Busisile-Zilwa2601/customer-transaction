import { createLogger, transports, format } from 'winston';

export const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: format.combine(
        format.timestamp(),
        format.errors({stack: true}),
        format.splat(),
        format.json()
    ),
    defaultMeta: {service: 'authservice'},
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        }),
        // new transports.File({filename: 'authservice_error.log', level: 'error'}),
        // new transports.File({filename: 'authservice_combined.log'})
    ]
}); 