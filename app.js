const express = require('express');
const path = require('path');
const appLogger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const LgApi = require('node-lgtv-api');
const Alexa = require('alexa-app');
const AlexaManager = require('./managers/alexa');
const LgManager = require('./managers/lg');
const DynamicIpManager = require('./managers/dyn-ip');
const config = require('./config/config');
const Logger = require('./helpers/logger');

const app = express();
const env = process.env.NODE_ENV || 'development';

app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env === 'development';

process.on('unhandledRejection', (reason) => Logger.error(`unhandled rejection: ${reason}`));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(appLogger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', routes);

// lg
const lgApi = new LgApi(config.lgTV.ip, config.lgTV.port, config.lgTV.pin);
const lgMgr = new LgManager(lgApi);

// alexa
const alexaApp = new Alexa.app(config.alexa.appName); // eslint-disable-line new-cap
const alexaMgr = new AlexaManager(lgMgr, alexaApp);

alexaApp.express(app, config.alexa.route);
alexaMgr.init();

// refresh IP
const dynamicIpManager = new DynamicIpManager(); // eslint-disable-line no-unused-vars

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler - will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler - no stacktraces leaked to user
app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});

module.exports = app;
