/* @flow */

import _ from 'lodash';

import { equals, ReducerRegistry, set } from '../redux';

import {
    CONFIG_WILL_LOAD,
    LOAD_CONFIG_ERROR,
    SET_CONFIG
} from './actionTypes';

/**
 * The initial state of the feature base/config when executing in a
 * non-React Native environment. The mandatory configuration to be passed to
 * JitsiMeetJS#init(). The app will download config.js from the Jitsi Meet
 * deployment and take its values into account but the values bellow will be
 * enforced (because they are essential to the correct execution of the
 * application).
 *
 * @type {Object}
 */
const INITIAL_NON_RN_STATE = {
};

/**
 * The initial state of the feature base/config when executing in a React Native
 * environment. The mandatory configuration to be passed to JitsiMeetJS#init().
 * The app will download config.js from the Jitsi Meet deployment and take its
 * values into account but the values bellow will be enforced (because they are
 * essential to the correct execution of the application).
 *
 * @type {Object}
 */
const INITIAL_RN_STATE = {
    // FIXME The support for audio levels in lib-jitsi-meet polls the statistics
    // of WebRTC at a short interval multiple times a second. Unfortunately,
    // React Native is slow to fetch these statistics from the native WebRTC
    // API, through the React Native bridge and eventually to JavaScript.
    // Because the audio levels are of no interest to the mobile app, it is
    // fastest to merely disable them.
    disableAudioLevels: true,

    p2p: {
        disableH264: false,
        preferH264: true
    }
};

ReducerRegistry.register(
    'features/base/config',
    (state = _getInitialState(), action) => {
        switch (action.type) {
        case CONFIG_WILL_LOAD:
            return {
                error: undefined
            };

        case LOAD_CONFIG_ERROR:
            return {
                error: action.error
            };

        case SET_CONFIG: {
            // $FlowExpectedError
            console.info(`TO BE REDUCED ${action.config.p2p.enabled}`);

            const newConfig = _setConfig(state, action);

            declare var config: Object;

            // FIXME On web we rely on the global 'config' variable which gets
            // altered multiple times, before it makes it to the reducer. At
            // some point it may not be the global variable which is being
            // modified anymore due to different merge methods being used
            // across the way. The global variable must be synchronized with
            // the final state resolved by the reducer.
            if (typeof window !== 'undefined' && window.config) {
                window.config = newConfig;
                console.info('CONFIG GLOBAL UPDATED');
            }

            // $FlowExpectedError
            console.info(`SET CONFIG REDUCED: ${config.p2p.enabled} `);
            console.info(`WINDOW: ${window.config.p2p.enabled}`);

            // $FlowExpectedError
            console.info(`NEW CONFIG: ${newConfig.p2p.enabled}`);

            return newConfig;
        }

        default:
            return state;
        }
    });

/**
 * Gets the initial state of the feature base/config. The mandatory
 * configuration to be passed to JitsiMeetJS#init(). The app will download
 * config.js from the Jitsi Meet deployment and take its values into account but
 * the values bellow will be enforced (because they are essential to the correct
 * execution of the application).
 *
 * @returns {Object}
 */
function _getInitialState() {
    return (
        navigator.product === 'ReactNative'
            ? INITIAL_RN_STATE
            : INITIAL_NON_RN_STATE);
}

/**
 * Reduces a specific Redux action SET_CONFIG of the feature
 * base/lib-jitsi-meet.
 *
 * @param {Object} state - The Redux state of the feature base/lib-jitsi-meet.
 * @param {Action} action - The Redux action SET_CONFIG to reduce.
 * @private
 * @returns {Object} The new state of the feature base/lib-jitsi-meet after the
 * reduction of the specified action.
 */
function _setConfig(state, { config }) {
    // The mobile app bundles jitsi-meet and lib-jitsi-meet at build time and
    // does not download them at runtime from the deployment on which it will
    // join a conference. The downloading is planned for implementation in the
    // future (later rather than sooner) but is not implemented yet at the time
    // of this writing and, consequently, we must provide legacy support in the
    // meantime.

    console.info(`before translate legacy ${config.p2p.enabled}`);
    console.info(`before translate legacy full ${JSON.stringify(config)}`);

    // eslint-disable-next-line no-param-reassign
    config = _translateLegacyConfig(config);

    console.info(`after translate legacy ${config.p2p.enabled}`);

    const newState = _.merge(
        {},
        config,
        { error: undefined },

        // The config of _getInitialState() is meant to override the config
        // downloaded from the Jitsi Meet deployment because the former contains
        // values that are mandatory.
        _getInitialState()
    );

    console.info(`after merge ${newState.p2p.enabled}`);

    const result = equals(state, newState) ? state : newState;

    // $FlowExpectedError
    console.info(`result ${result.p2p.enabled}`);

    return result;
}

/**
 * Constructs a new config {@code Object}, if necessary, out of a specific
 * config {@code Object} which is in the latest format supported by jitsi-meet.
 * Such a translation from an old config format to a new/the latest config
 * format is necessary because the mobile app bundles jitsi-meet and
 * lib-jitsi-meet at build time and does not download them at runtime from the
 * deployment on which it will join a conference.
 *
 * @param {Object} oldValue - The config {@code Object} which may or may not be
 * in the latest form supported by jitsi-meet and from which a new config
 * {@code Object} is to be constructed if necessary.
 * @returns {Object} A config {@code Object} which is in the latest format
 * supported by jitsi-meet.
 */
function _translateLegacyConfig(oldValue: Object) {
    // jitsi/jitsi-meet#3ea2f005787c9f49c48febaeed9dc0340fe0a01b

    let newValue = oldValue;

    // At the time of this writing lib-jitsi-meet will rely on config having a
    // property with the name p2p and with a value of type Object.
    if (typeof oldValue.p2p !== 'object') {
        console.info('old value p2p is not an object');
        newValue = set(newValue, 'p2p', {});
    }

    /* eslint-disable indent */

    // Translate the old config properties into the new config.p2p properties.
    for (const [ oldKey, newKey ]
            of [
                [ 'backToP2PDelay', 'backToP2PDelay' ],
                [ 'enableP2P', 'enabled' ],
                [ 'p2pStunServers', 'stunServers' ]
            ]) {

    /* eslint-enable indent */

        if (oldKey in newValue) {

            console.info(`${oldKey} in newValue`);

            const v = newValue[oldKey];

            // Do not modify oldValue.
            if (newValue === oldValue) {
                newValue = {
                    ...newValue
                };
            }

            console.info(`Delete ${oldKey}`);

            delete newValue[oldKey];

            // Do not modify p2p because it may be from oldValue i.e. do not
            // modify oldValue.
            newValue.p2p = {
                ...newValue.p2p,
                [newKey]: v
            };

            console.info(`New value p2p ${JSON.stringify(newValue.p2p)}`);
        }
    }

    return newValue;
}
