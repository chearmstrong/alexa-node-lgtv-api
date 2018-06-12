// http://<username>:<password>@freedns.afraid.org/nic/update?hostname=<username>.mooo.com&myip=x.x.x.x

const publicIp = require('public-ip');
const Promise = require('bluebird');
const needle = Promise.promisifyAll(require('needle'));
const Logger = require('../helpers/logger');
const config = require('../config/config').dynDns;
const util = require('util');

module.exports = class DynamicIpManager {
    constructor() {
        this.getIp();
    }

    getIp() {
        return publicIp.v4()
            .then((ip) => {
                this.url = util.format(config.url, config.username, config.password, config.hostname, ip);
                return this.refreshIp();
            })
            .catch((err) => Logger.error(err.message || err));
    }

    refreshIp() {
        Logger.info('refreshing IP address with dynamic dns provider');
        return needle.getAsync(this.url)
            .then((response) => Logger.info(response.body))
            .catch((err) => Logger.error(err.message || err))
            .finally(() => setTimeout(() => this.getIp(), config.period));
    }
};
