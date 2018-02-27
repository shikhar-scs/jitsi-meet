// @flow

import { Component } from 'react';

/**
 * Describes audio element interface used in the base/media feature for audio
 * playback.
 */
export type AudioElement = {
    +play: Function,
    +pause: Function,
    +setSinkId?: string => void
}

/**
 * {@code AbstractAudio} component's property types.
 */
type Props = {

    /**
     * A callback which will be called with {@code AbstractAudio} instance once
     * the audio element is loaded.
     */
    setRef?: ?AudioElement => void,

    /**
     * The URL of a media resource to use in the element.
     *
     * NOTE on react-native sound files are imported through 'require' and then
     * passed as the 'src' parameter which means their type will be 'any'.
     *
     * @type {string | Object}
     */
    src: string | Object,
    stream: Object
}

/**
 * The React {@link Component} which is similar to Web's
 * {@code HTMLAudioElement}.
 */
export default class AbstractAudio extends Component<Props> {
    /**
     * The {@link AudioElement} instance which implements the audio playback
     * functionality.
     */
    _audioElementImpl: ?AudioElement;

    /**
     * {@link setAudioElementImpl} bound to <code>this</code>.
     */
    setAudioElementImpl: ?AudioElement => void;

    /**
     * Initializes a new {@code AbstractAudio} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Object) {
        super(props);

        // Bind event handlers so they are only bound once for every instance.
        this.setAudioElementImpl = this.setAudioElementImpl.bind(this);
    }

    /**
     * Attempts to pause the playback of the media.
     *
     * @public
     * @returns {void}
     */
    pause(): void {
        this._audioElementImpl && this._audioElementImpl.pause();
    }

    /**
     * Attempts to being the playback of the media.
     *
     * @public
     * @returns {void}
     */
    play(): void {
        this._audioElementImpl && this._audioElementImpl.play();
    }

    /**
     * Sets the sink ID (output device ID) on the underlying audio element.
     * NOTE: Currently implemented only on web.
     *
     * @param {string} sinkId - The sink ID (output device ID).
     * @returns {void}
     */
    setSinkId(sinkId: string): void {
        this._audioElementImpl
            && typeof this._audioElementImpl.setSinkId === 'function'
            && this._audioElementImpl.setSinkId(sinkId);
    }

    /**
     * Set the (reference to the) {@link AudioElement} object which implements
     * the audio playback functionality.
     *
     * @param {AudioElement} element - The {@link AudioElement} instance
     * which implements the audio playback functionality.
     * @protected
     * @returns {void}
     */
    setAudioElementImpl(element: ?AudioElement): void {
        this._audioElementImpl = element;

        if (typeof this.props.setRef === 'function') {
            this.props.setRef(element ? this : null);
        }
    }
}
