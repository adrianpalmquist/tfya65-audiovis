'use strict';

var AudioHandler = function(analyser, buffer) {
    //console.log(typeof(analyser));
    this.analyser = analyser;
    this.source = audioCtx.createBufferSource();
    this.buffer = buffer;
    this.bufferDuration = this.buffer.duration;
    window.console.log(this.analyser);
    this.source.buffer = this.buffer;
    this.source.connect(this.analyser);
    this.analyser.connect(audioCtx.destination);
    this.currentNode = this.source;
    this.firstEffect = null;
    this.DEFAULT_GAIN = 0.5;
    this.DEFAULT_FILTER_GAIN = 12.0;
    this.DEFAULT_Q = 20.0;

    this.isPlaying = false;
    this.startTime = 0;
    this.startOffset = 0;

    this.filterGain = this.DEFAULT_FILTER_GAIN;
    this.filterQ = this.DEFAULT_Q;
    this.convolverSound = null;

    var that = this;
    var bufferLoader = new BufferLoader(audioCtx, [
            'sounds/church.mp3',
        ],
        that.loadConvolverSound.bind(that)
    );

    bufferLoader.load();

    // eventlistener, bind to changefilter

    var filterSelect = document.getElementById('filter');
    var temp = this;
    filterSelect.addEventListener('change', function()  {
        temp.changeFilter(filterSelect.value);
    });


};

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


AudioHandler.prototype.togglePlayback = function() {

    if (this.isPlaying) {
        // Stop playback
        this.source[this.source.stop ? 'stop' : 'noteOff'](0);

        if(this.source.buffer === this.buffer) {
            this.startOffset += audioCtx.currentTime - this.startTime;
        } else {
            this.startOffset = 0;
        }

    } else {
        // start playback
        this.startTime = audioCtx.currentTime;
        // Connect graph
        this.source = audioCtx.createBufferSource();
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

AudioHandler.prototype.resetEffects = function() {
    this.firstEffect = null;
    this.filterGain = this.DEFAULT_FILTER_GAIN;
    this.filterQ = this.DEFAULT_Q;
    this.source.disconnect();
    this.source.connect(this.analyser);
    this.currentNode = this.source;
};

AudioHandler.prototype.changeFilter = function(currentFilter) {
    window.console.log("Changing filter");
    this.resetEffects();
    switch (currentFilter) {
        case 'lowpass':
            this.addBiQuadFilter('lowpass', 500);
            break;
        case 'highpass':
            this.addBiQuadFilter('highpass', 5000);
            break;
        case 'bassboost':
            this.addBiQuadFilter('lowshelf', 440);
            break;
        case 'voiceboost':
            this.addBiQuadFilter('peaking', 3000);
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

AudioHandler.prototype.addBiQuadFilter = function(type, cutoffFrequency) {
    var filter = audioCtx.createBiquadFilter();
    filter.type = type;
    filter.gain.value = this.filterGain;
    filter.Q.value = 5;
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
