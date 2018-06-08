module.exports = {
    openTvApp: {
        slots: {
            lgApps: 'APPS', // custom slot - LG TV apps
            appAction: 'AMAZON.LITERAL'
        },
        utterances: [
            '{appActions|appAction} {-|lgApps}'
        ]
    },
    changeChannelName: {
        slots: {
            freeviewChannel: 'FREEVIEW' // custom slot - freeview TV channels (see channels.txt)
        },
        utterances: [
            '{change|turn} the tv to {-|freeviewChannel}'
        ]
    },
    changeChannelNumber: {
        slots: {
            number: 'NUMBER'
        },
        utterances: [
            'go to{ tv|} channel {1-802|number}'
        ]
    },
    tvOn: {
        slots: {},
        utterances: [
            'turn {the |}tv on',
            'turn on the tv',
            'activate'
        ]
    },
    tvOff: {
        slots: {},
        utterances: [
            'turn {the |}tv off',
            'turn off the tv'
        ]
    }
};
