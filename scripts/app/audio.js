'use strict';

/**
 * Audio handler for the visualiser. Manages playback and effects.
 * @param {AnalyserNode} analyser - Analyser to use
 * @param {AudioBuffer} buffer - Buffer to initialize the AudioHandler with
 */
var AudioHandler = function(analyser, buffer) {
    this.analyser = analyser;
    this.source = audioCtx.createBufferSource();
    this.buffer = buffer;
    this.bufferDuration = this.buffer.duration;
    this.source.buffer = this.buffer;
    this.source.connect(this.analyser);
    this.analyser.connect(audioCtx.destination);
    this.currentNode = this.source;
    // Leftover from previous code. Could be used for applying multiple effects
    this.firstEffect = null;
    
    this.DEFAULT_GAIN = 0.5; // Default gain for the gainNode in amplitude
    this.DEFAULT_FILTER_GAIN = 6.0; // Default gain for filters in dB
    this.DEFAULT_Q = 6; // Default Q value for filters

    this.isPlaying = false; // Start paused
    this.startTime = 0;
    this.startOffset = 0;

    this.filterGain = this.DEFAULT_FILTER_GAIN;
    this.filterQ = this.DEFAULT_Q;
    this.convolverSound = null;

    // Load impulse response used for the reverb effect
    var that = this;
    var bufferLoader = new BufferLoader(audioCtx, [
            'sounds/church.mp3',
        ],
        that.loadConvolverSound.bind(that)
    );

    bufferLoader.load();

    // Listen to the filter dropdown menu and change filter
    // if the user selects a new filter
    var filterSelect = document.getElementById('filter');
    var self = this;
    filterSelect.addEventListener('change', function()  {
        self.changeFilter(filterSelect.value);
    });

    window.console.log("AudioHandler loaded.");


};

/**
 * Change AudioBuffer
 * @param  {AudioBuffer} buffer - New AudioBuffer to use
 */
AudioHandler.prototype.changeBuffer = function(buffer) {
    this.buffer = buffer;
    this.bufferDuration = this.buffer.duration;
    this.startTime = 0;
    this.startOffset = 0;
    this.togglePlayback();
    this.togglePlayback();
};

AudioHandler.prototype.loadConvolverSound = function(buffers) {
    this.convolverSound = buffers[0];
};

/** Toggle playback. Have to create new AudioBuffer to start playback  */
AudioHandler.prototype.togglePlayback = function() {

    if (this.isPlaying) {
        // Stop playback
        this.source[this.source.stop ? 'stop' : 'noteOff'](0);

        // Necessary for loading new buffer both when paused and playing
        if(this.source.buffer === this.buffer) {
            this.startOffset += audioCtx.currentTime - this.startTime;
        } else {
            this.startOffset = 0;
        }

    } else {
        this.startTime = audioCtx.currentTime;
        this.source = audioCtx.createBufferSource();

        // Leftovers
        if (this.firstEffect === null) {
            this.source.connect(this.analyser);
        } else {
            this.source.connect(this.firstEffect);
        }

        this.source.buffer = this.buffer;
        this.source.loop = true;
        // Start playback, but make sure we stay in bound of the buffer.
        this.source[this.source.start ? 'start' : 'noteOn'](0, this.startOffset % this.bufferDuration);
    }

    this.isPlaying = !this.isPlaying;

};

/** Apply chosen effect and handle the chain of nodes */
AudioHandler.prototype.applyEffect = function(effect) {
    if (this.firstEffect === null) {
        this.firstEffect = effect;
    }
    this.currentNode.disconnect();
    this.currentNode.connect(effect);
    this.currentNode = effect;
    window.console.log(this.currentNode);
    this.currentNode.connect(this.analyser);
};

/** Reset effects and connect source directly to the analyser */
AudioHandler.prototype.resetEffects = function() {
    this.firstEffect = null;
    this.filterGain = this.DEFAULT_FILTER_GAIN;
    this.filterQ = this.DEFAULT_Q;
    this.source.disconnect();
    this.source.connect(this.analyser);
    this.currentNode = this.source;
};

/** Change filter depending on what the user chooses */
AudioHandler.prototype.changeFilter = function(currentFilter) {
    window.console.log("Changing filter");
    this.resetEffects();
    switch (currentFilter) {
        case 'lowpass':
            this.addBiQuadFilter('lowpass', 500, 1, 1);
            break;
        case 'highpass':
            this.addBiQuadFilter('highpass', 5000, 1, 1);
            break;
        case 'bassboost':
            this.addBiQuadFilter('lowshelf', 440);
            break;
        case 'voiceboost':
            this.addBiQuadFilter('peaking', 3000, 9, 1);
            break;
        case 'trebleboost':
            this.addBiQuadFilter('highshelf', 4000);
            break;
        case 'telephone':
            this.addBiQuadFilter('bandpass', 2000);
            break;
        case 'distortion':
            this.addDistortion();
            break;
        case 'convolver':
            this.addConvolver();
            break;
        default:
            this.resetEffects();
            window.console.log('No filter selected');
            break;
    }
};

AudioHandler.prototype.changeGain = function(gain) {
    this.filterGain = gain;
};

AudioHandler.prototype.changeQ = function(q) {
    this.filterQ = q;
};

/**
 * Add a new BiquadFilter to the processing chain
 * @param {string} type - Name of the type of filter that should be created
 * @param {float} cutoffFrequency 
 */
AudioHandler.prototype.addBiQuadFilter = function(type, cutoffFrequency, q, gain) {
    var filter = audioCtx.createBiquadFilter();
    filter.type = type;
    filter.gain.value = gain || this.filterGain;
    filter.Q.value = q || this.filterQ;
    filter.frequency.value = cutoffFrequency;
    this.applyEffect(filter);
};

AudioHandler.prototype.addGainNode = function() {
    var gainNode = audioCtx.createGain();
    gainNode.gain.value = this.DEFAULT_GAIN;
    this.applyEffect(gainNode);
};

AudioHandler.prototype.addDistortion = function() {
    var distortion = audioCtx.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(20);
    distortion.oversample = '4x';
    this.applyEffect(distortion);
};

/** Curve algorithm taken from https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode/curve */
AudioHandler.prototype.makeDistortionCurve = function(amount) {
    var k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180,
        i = 0,
        x;
    for (; i < n_samples; ++i) {
        x = i * 2 / n_samples - 1;
        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
};


AudioHandler.prototype.addConvolver = function() {
    var convolver = audioCtx.createConvolver();
    convolver.buffer = this.convolverSound;
    this.applyEffect(convolver);
};
