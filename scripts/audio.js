var AudioHandler = function(analyser, buffers) {
    //console.log(typeof(analyser));
    this.analyser = analyser;
    this.source = audioCtx.createBufferSource();
    this.bufferList = buffers;
    this.buffer = this.bufferList[0];
    this.bufferDuration = this.buffer.duration;
    console.log(this.analyser);
    this.source.buffer = this.buffer;
    this.source.connect(this.analyser);
    this.analyser.connect(audioCtx.destination);
    this.currentNode = this.source;
    this.firstEffect = null;
    var DEFAULT_GAIN = 25;
    var DEFAULT_Q = 5;

    this.isPlaying = false;
    this.startTime = 0;
    this.startOffset = 0;
    
    this.filterGain = DEFAULT_GAIN;
    this.filterQ = DEFAULT_Q;
    this.convolverSound = buffers[1];

    


    // eventlistener, bind to changefilter

    var filterSelect = document.getElementById("filter");
    var temp = this;
    filterSelect.addEventListener("change", function()  {
        temp.changeFilter(filterSelect.value);
    });

    // var gainSelect = document.getElementById("gainControl");
    // gainSelect.addEventListener("change", function() {
    //     temp.changeGain(gainSelect.value);
    // });

    // var qSelect = document.getElementById("qSelect");
    // gainSelect.addEventListener("change", function() {
    //     temp.changeQ(qSelect.value);
    // });

    //console.log(filterSelect.value);


};



AudioHandler.prototype.togglePlayback = function() {
    if (this.isPlaying) {
        // Stop playback
        this.source[this.source.stop ? 'stop' : 'noteOff'](0);
        this.startOffset += audioCtx.currentTime - this.startTime;
    } else {
        // start playback
        this.startTime = audioCtx.currentTime;
        // Connect graph
        this.source = audioCtx.createBufferSource();
        if(this.firstEffect === null) {
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
    if(this.firstEffect === null) {
        this.firstEffect = effect;
    }
    this.currentNode.disconnect();
    this.currentNode.connect(effect);
    this.currentNode = effect;
    console.log(this.currentNode);
    this.currentNode.connect(this.analyser);
};

AudioHandler.prototype.removeEffect = function(effectName) {
    this.currentNode.disconnect(parent);
    this.child.connect(parent.context);
};

AudioHandler.prototype.resetEffects = function() {
    this.firstEffect = null;
    this.source.disconnect();
    this.source.connect(this.analyser);
    this.currentNode = this.source;
};

AudioHandler.prototype.changeFilter = function(currentFilter) {
    this.resetEffects();
    switch (currentFilter) {
        case 'lowpass':
            this.addBiQuadFilter('lowpass', 500);
            break;
        case 'highpass':
            this.addBiQuadFilter('highpass', 5000);
            break;
        case 'bassboost':
            this.addBiQuadFilter('lowshelf', 300);
            break;
        case 'voiceboost':
            this.addBiQuadFilter('peaking', 3000);
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
            console.log('No filter selected');
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
    filter.gain = this.filterGain;
    filter.Q.value = 5;
    filter.frequency.value = cutoffFrequency;
    this.applyEffect(filter);
};


AudioHandler.prototype.addDistortion = function() {
    var distortion = audioCtx.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(400);
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


AudioHandler.prototype.addConvolver = function(first_argument) {
    var convolver = audioCtx.createConvolver();
    convolver.buffer = this.convolverSound;
    this.applyEffect(convolver);
};
