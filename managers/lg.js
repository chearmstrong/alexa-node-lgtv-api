const Promise = require('bluebird');
const Logger = require('../helpers/logger');
const memCache = require('memory-cache');
const _ = require('underscore');
const fs = Promise.promisifyAll(require('fs'));
const converter = require('number-to-words');
const appMap = require('../config/lg-apps-map');

module.exports = class LgManager {
    constructor(lgApi) {
        this.lg = Promise.promisifyAll(lgApi);
        // this.writeChannelsToFile();
    }

    lgSimpleAction(command) {
        return this.lg.authenticate()
            .then(() => this.lg.processCommand(this.lg[command], []));
    }

    lgApps(appn, actn) {
        const app = appn.toLowerCase();
        const action = actn.toLowerCase();

        Logger.error(`attempting to open ${app}`);

        if (!appMap[app]) {
            return Promise.reject(new Error(`${app} doesn't exist`));
        }

        const requestedApp = [{
            appname: appMap[app].name, // Netflix
            auid: appMap[app].id // 00000000000112ae
        }];

        let fn = 'TV_LAUNCH_APP';

        if (action === 'close') {
            fn = 'TV_TERMINATE_APP';
        }

        return this.lg.authenticate()
            .then(() => this.lg.processCommand(this.lg[fn], requestedApp));
    }

    refreshChannelList() {
        return this.lg.authenticate()
            .then(() => this.lg.queryData(this.lg.TV_INFO_CHANNEL_LIST))
            .then((data) => memCache.put('channelList', data));
    }

    getChannelList() {
        const promise = memCache.get('channelList') ? Promise.resolve() : this.refreshChannelList();
        return promise
            .then(() => memCache.get('channelList'));
    }

    changeChannelName(reqChan) {
        Logger.info(`changing tv to channel ${requestedChannel}`);

        if (typeof requestedChannel !== 'string') {
            return Promise.reject(new Error('TV channel name must be a string'));
        }

        let requestedChannel = reqChan.toLowerCase();

        return this.lg.authenticate()
            .then(() => this.getChannelList())
            .then((list) => {
                let channel = _.find(list, (chan) => {
                    const channelName = chan.chname[0].toLowerCase().replace(/\s/g, '');
                    return channelName.indexOf(requestedChannel.replace(/\s/g, '')) >= 0;
                });

                if (!channel) {
                    Logger.info(`${requestedChannel} not found - converting numbers to words`);

                    const regex = /[0-9]/;
                    const matches = requestedChannel.match(regex);
                    const numWord = converter.toWords(matches[0]);

                    // only want the convert the first number (to keep the +1 on channel names)
                    requestedChannel = requestedChannel.replace(regex, numWord);
                }

                channel = _.find(list, (chan) => {
                    const channelName = chan.chname[0].toLowerCase().replace(/\s/g, '');
                    return channelName.indexOf(requestedChannel.replace(/\s/g, '')) >= 0;
                });

                if (!channel) {
                    return Promise.reject(new Error(`${requestedChannel} not found`));
                }

                return this.lg.processCommand(this.lg.TV_CMD_CHANGE_CHANNEL, channel);
            });
    }

    changeChannelNumber(num) {
        Logger.info(`changing tv to channel number ${num}`);

        const number = parseInt(num); // eslint-disable-line radix

        if (typeof number !== 'number') {
            return Promise.reject(new Error('TV channel must be a number'));
        }

        return this.lg.authenticate()
            .then(() => this.getChannelList())
            .then((list) => {
                const channel = _.find(list, (chan) => {
                    const channelNumber = parseInt(chan.major[0]); // eslint-disable-line radix
                    return channelNumber === number;
                });

                if (!channel) {
                    return Promise.reject(new Error(`channel number ${number} not found`));
                }

                return this.lg.processCommand(this.lg.TV_CMD_CHANGE_CHANNEL, channel);
            });
    }

    writeChannelsToFile() {
        return this.lg.authenticate()
            .then(() => this.getChannelList())
            .then((list) => {
                let channelList = _.chain(list).pluck('chname').flatten(true);
                channelList = JSON.stringify(channelList);
                channelList = channelList.toLowerCase();
                channelList = channelList.replace(new RegExp(/,/, 'g'), '\r\n');
                channelList = channelList.replace(new RegExp(/"|\[|\]/, 'g'), '');

                return fs.writeFileAsync(`${__dirname}/../channels.txt`, channelList);
            })
            .catch((err) => Logger.error(err.message || err));
    }
};
