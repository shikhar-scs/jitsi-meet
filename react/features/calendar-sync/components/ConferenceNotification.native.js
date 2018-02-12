// @flow
import React, { Component } from 'react';
import {
    Dimensions,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { connect } from 'react-redux';

import { appNavigate } from '../../app';
import { getURLWithoutParams } from '../../base/connection';
import { translate } from '../../base/i18n';
import { Icon } from '../../base/font-icons';
import { getLocalizedDateFormatter } from '../../base/util';

import styles from './styles';

const ALERT_MILLISECONDS = 5 * 60 * 1000;

type Props = {

    /**
     * The Redux dispatch function.
     */
    dispatch: Function,

    /**
     * The URL of the current conference without params.
     */
    _currentConferenceURL: string,

    /**
     * The calendar event list.
     */
    _eventList: Array<Object>,

    /**
     * The height of the screen. Needed to be in props to trigger a re-render.
     */
    _screenHeight: number,

    /**
     * The translate function.
     */
    t: Function
};

type State = {

    /**
     * The event object to display the notification for.
     */
    event?: Object
};

/**
 * Component to display a permanent badge-like notification on the
 * conference screen when another meeting is about to start.
 */
class ConferenceNotification extends Component<Props, State> {
    updateIntervalId: number;

    /**
     * Constructor of the ConferenceNotification component.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        this.state = {
            event: undefined
        };

        this._getContainerStyle = this._getContainerStyle.bind(this);
        this._maybeDisplayNotification
            = this._maybeDisplayNotification.bind(this);
        this._onGoToNext = this._onGoToNext.bind(this);
    }

    /**
     * Implements React Component's componentWillMount.
     *
     * @inheritdoc
     */
    componentWillMount() {
        this.updateIntervalId = setInterval(
            this._maybeDisplayNotification,
            10 * 1000
        );
    }

    /**
     * Implements React Component's componentWillUnmount.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        if (this.updateIntervalId) {
            clearTimeout(this.updateIntervalId);
        }
    }

    /**
     * Implements the React Components's render method.
     *
     * @inheritdoc
     */
    render() {
        const { event } = this.state;

        if (event) {
            return (
                <View style = { this._getContainerStyle() }>
                    <TouchableOpacity
                        onPress = { this._onGoToNext } >
                        <View style = { styles.touchableView }>
                            <View style = { styles.notificationTextContainer }>
                                <Text style = { styles.notificationText }>
                                    next meeting
                                </Text>
                                <Text style = { styles.notificationText }>
                                    {
                                        getLocalizedDateFormatter(
                                            event.startDate
                                        ).fromNow()
                                    }
                                </Text>
                            </View>
                            <View style = { styles.notificationIconContainer }>
                                <Icon
                                    name = 'navigate_next'
                                    style = { styles.notificationIcon } />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    }

    _getContainerStyle: () => Array<Object>;

    /**
     * Assembles a style array for the container.
     *
     * @private
     * @returns {Array<Object>}
     */
    _getContainerStyle() {
        const { event } = this.state;
        const now = Date.now();
        const style = [
            styles.notificationContainer,
            {
                top: this.props._screenHeight / 10
            }
        ];

        if (event && event.startDate < now && event.endDate > now) {
            style.push(styles.notificationContainerPast);
        }

        return style;
    }

    _maybeDisplayNotification: () => void;

    /**
     * Periodically checks if there is an event in the calendar for which we
     * need to show a notification.
     *
     * @private
     * @returns {void}
     */
    _maybeDisplayNotification() {
        const { _currentConferenceURL, _eventList } = this.props;
        let eventToShow;

        if (_eventList && _eventList.length) {
            const now = Date.now();

            for (const event of _eventList) {
                if (event.url !== _currentConferenceURL) {
                    if ((!eventToShow
                        && event.startDate > now
                        && event.startDate < now + ALERT_MILLISECONDS)
                        || (event.startDate < now && event.endDate > now)
                    ) {
                        eventToShow = event;
                    }
                }
            }
        }

        this.setState({
            event: eventToShow
        });
    }

    _onGoToNext: () => void;

    /**
     * Opens the meeting URL that the notification shows.
     *
     * @private
     * @param {string} url - The URL to open.
     * @returns {void}
     */
    _onGoToNext() {
        const { event } = this.state;

        if (event && event.url) {
            this.props.dispatch(appNavigate(event.url));
        }
    }

}

/**
 * Maps redux state to component props.
 *
 * @param {Object} state - The redux state.
 * @returns {{
 *      _eventList: Array,
 *      _screenHeight: number
 * }}
 */
export function _mapStateToProps(state: Object) {
    const { height } = Dimensions.get('window');
    const { locationURL } = state['features/base/connection'];

    return {
        _currentConferenceURL:
            locationURL ? getURLWithoutParams(locationURL)._url : '',
        _eventList: state['features/calendar-sync'].events,
        _screenHeight: height
    };
}

export default translate(connect(_mapStateToProps)(ConferenceNotification));
