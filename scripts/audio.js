var AudioHandler = function(analyser) {
    //console.log(typeof(analyser));
    this.analyser = analyser;
    this.source = audioCtx.createBufferSource();
    this.source.connect(this.analyser);
    this.analyser.connect(audioCtx.destination);
    this.currentNode = this.source;
    this.firstEffect = null;

    this.isPlaying = false;
    this.startTime = 0;
    this.startOffset = 0;
    this.bufferDuration = 0;
    this.buffer;


    // eventlistener, bind to changefilter

    var filterSelect = document.getElementById("filter");
    var temp = this;
    filterSelect.addEventListener("change", function()  {
        temp.changeFilter(filterSelect.value);
    });
    //console.log(filterSelect.value);


};


AudioHandler.prototype.playSound = function(buffer) {
    this.source.buffer = buffer; // Attatch our Audio Data as it's Buffer
    this.buffer = buffer;
    this.bufferDuration = buffer.duration;
    //source.loop = true;
    //source.connect(audioCtx.destination); // Link the Sound to the Output
    this.source.start(0);
    this.isPlaying = true;
};

AudioHandler.prototype.togglePlayback = function() {
    if (this.isPlaying) {
        // Stop playback
        this.source[this.source.stop ? 'stop' : 'noteOff'](0);
        this.startOffset += audioCtx.currentTime - this.startTime;
    } else {
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
    switch (currentFilter) {
        case 'biquad':
            this.addBiQuadFilter('lowpass', 500);
            break;
        case 'distortion':
            this.addDistortion();
            break;
        default:
            this.resetEffects();
            console.log('No filter selected');
            break;
    }
};

AudioHandler.prototype.addBiQuadFilter = function(type, cutoffFrequency) {
    var filter = audioCtx.createBiquadFilter();
    filter.type = type;
    filter.gain = 25;
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

};
