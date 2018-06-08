module.exports = {
    alexa: {
        route: '/alexa/',
        appName: 'ellie'
    },
    logger: {
        level: 'debug'
    },
    dynDns: { // http://freedns.afraid.org/
        url: process.env.DNS_URL || null,
        username: process.env.DNS_USERNAME || null,
        password: process.env.DNS_PASSWORD || null,
        hostname: process.env.DNS_HOSTNAME || null,
        period: 1000 * 60 * 60 * 24 // 24 hours
    },
    lgTV: { // https://github.com/timmson/node-lgtv-api
        ip: process.env.LG_IP || null,
        port: process.env.PORT,
        pin: process.env.LG_PIN || null
    }
};
