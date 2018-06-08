const Promise = require('bluebird');
const intents = require('../config/intents');
const dictionary = require('../config/dictionary');
const Logger = require('../helpers/logger');

module.exports = class AlexaManager {
    constructor(lg, alexaApp) {
        this.alexaApp = alexaApp;
        this.lg = lg;
    }

    init() {
        this.alexaSetup();
        this.alexaIntents();
    }

    static toTitleCase(str) {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    alexaSetup() {
        this.alexaApp.error = (err, req, res) => {
            Logger.error(`an error occured: ${err}`);
            res.clear().say(`an error occured: ${err}`);
        };

        this.alexaApp.launch((req, res) => {
            Logger.info('alexa app launched');
            res.say('you launched the app').send();
        });

        this.alexaApp.post = (req, res, type, exception) => {
            if (exception) {
                Logger.error(`an error occured: ${exception}`);
                res.clear().say(`an error occured: ${exception}`).send();
            }
        };

        this.alexaApp.dictionary = dictionary;
    }

    alexaIntents() {
        // open tv app
        this.alexaApp.intent('openTvApp', intents.openTvApp, (req, res) => {
            const app = req.slot('lgApps');
            const action = req.slot('appAction');

            this.kodi
                .turnTVOn()
                .then(() => Promise.delay(3000))
                .then(() => this.lg.lgApps(app, action))
                .then(() => res.say('...').send())
                .catch((err) => {
                    Logger.error(err.message || err);
                    res.say(err.message || err).send();
                });

            return false;
        });

        // change tv channel
        this.alexaApp.intent('changeChannelName', intents.changeChannelName, (req, res) => {
            const channelName = req.slot('freeviewChannel');

            this.lg
                .changeChannelName(channelName)
                .then(() => res.say('...').send())
                .catch((err) => {
                    Logger.error(err.message || err);
                    res.say(err.message || err).send();
                });

            return false;
        });

        this.alexaApp.intent('changeChannelNumber', intents.changeChannelNumber, (req, res) => {
            const number = req.slot('number');

            this.lg
                .changeChannelNumber(number)
                .then(() => res.say('...').send())
                .catch((err) => {
                    Logger.error(err.message || err);
                    res.say(err.message || err).send();
                });

            return false;
        });

        // tv off
        this.alexaApp.intent('tvOff', intents.tvOff, (req, res) => {
            this.lg
                .lgSimpleAction('TV_CMD_POWER')
                .then(() => res.say('ok').send())
                .catch((err) => {
                    Logger.error(err.message || err);
                    res.say(err.message || err).send();
                });

            return false;
        });

    // end
    }
};
