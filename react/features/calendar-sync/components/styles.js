import { createStyleSheet } from '../../base/styles';

export const NOTIFICATION_SIZE = 55;

/**
 * The styles of the React {@code Component}s of the feature meeting-list i.e.
 * {@code MeetingList}.
 */
export default createStyleSheet({

    /**
     * The top level container of the notification.
     */
    notificationContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#eeb231',
        borderBottomRightRadius: NOTIFICATION_SIZE,
        borderTopRightRadius: NOTIFICATION_SIZE,
        flexDirection: 'row',
        height: NOTIFICATION_SIZE,
        justifyContent: 'center',
        paddingHorizontal: 10,
        position: 'relative'
    },

    /**
     * A style to be appended when the notification is about a
     * meeting that already started.
     */
    notificationContainerPast: {
        backgroundColor: 'red'
    },

    /**
     * The icon of the notification.
     */
    notificationIcon: {
        color: 'white',
        fontSize: 25
    },

    /**
     * The container that contains the icon.
     */
    notificationIconContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        height: NOTIFICATION_SIZE,
        justifyContent: 'center'
    },

    /**
     * A single line of text of the notification.
     */
    notificationText: {
        color: 'white',
        fontSize: 13
    },

    /**
     * The container for all the lines if the norification.
     */
    notificationTextContainer: {
        flexDirection: 'column',
        height: NOTIFICATION_SIZE,
        justifyContent: 'center'
    },

    /**
     * The touchable component.
     */
    touchableView: {
        flexDirection: 'row'
    }
});
