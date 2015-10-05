var AudioHandler = function(analyser) {
    //console.log(typeof(analyser));
    this.analyser = analyser;
    this.source = audioCtx.createBufferSource();
    this.source.connect(this.analyser);
    this.analyser.connect(audioCtx.destination);
    this.currentNode = this.source;

    // eventlistener, bind to changefilter
    
    var filterSelect = document.getElementById("filter");
    var temp = this;
    filterSelect.addEventListener("change", function() {
        temp.changeFilter(filterSelect.value);
    });
    //console.log(filterSelect.value);



};


AudioHandler.prototype.playSound = function(buffer) {
    this.source.buffer = buffer; // Attatch our Audio Data as it's Buffer
    //source.loop = true;
    //source.connect(audioCtx.destination); // Link the Sound to the Output
    this.source.start(0);
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

AudioHandler.prototype.changeFilter = function(currentFilter) {
    console.log(currentFilter);
    if (currentFilter == 'biquad')
    this.addBiQuadFilter('highpass', 400);
else
    console.log('No filter selected');
};

AudioHandler.prototype.addBiQuadFilter = function(type, cutoffFrequency) {
    var filter = audioCtx.createBiquadFilter();
    filter.type = type;
    filter.gain = 25;
    filter.frequency.value = cutoffFrequency;
    this.applyEffect(filter);
};
