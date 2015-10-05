var AudioHandler = function(analyser) {
    //console.log(typeof(analyser));
    this.analyser = analyser;
    this.source = audioCtx.createBufferSource();
    this.source.connect(this.analyser);
    this.analyser.connect(audioCtx.destination);
    this.currentNode = this.source;
    this.isPlaying = false;
    this.startTime = 0;
    this.startOffset = 0;
    this.bufferDuration = 0;
    this.buffer;
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
    if(this.isPlaying) {
        // Stop playback
        this.source[this.source.stop ? 'stop': 'noteOff'](0);
        this.startOffset += audioCtx.currentTime - this.startTime;

    } else {
        this.startTime = audioCtx.currentTime;
        // Connect graph
        this.source = audioCtx.createBufferSource();
        this.source.connect(this.analyser);
        this.source.buffer = this.buffer;
        this.source.loop = true;
        // Start playback, but make sure we stay in bound of the buffer.
        this.source[this.source.start ? 'start' : 'noteOn'](0, this.startOffset % this.bufferDuration);
    }

    this.isPlaying = !this.isPlaying;

};


AudioHandler.prototype.applyEffect = function(effect) {
    this.currentNode.disconnect();
    this.currentNode.connect(effect);
    this.currentNode = effect;
    this.currentNode.connect(this.analyser);
};

AudioHandler.prototype.removeEffect = function(effectName) {
    this.currentNode.disconnect(parent);
    this.child.connect(parent.context);
};

AudioHandler.prototype.resetEffects = function() {
    this.source.disconnect();
    this.source.connect(this.analyser);
    this.currentNode = this.source;
};

AudioHandler.prototype.addBiQuadFilter = function(type, cutoffFrequency) {
    var filter = audioCtx.createBiquadFilter();
    filter.type = 'lowshelf';
    filter.gain = 25;
    filter.frequency.value = cutoffFrequency;
    this.applyEffect(filter);
};
