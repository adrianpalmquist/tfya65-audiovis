var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

window.onload = function() {
    var app = new App();
    app.loadFile();
};

var App = function() {

    this.audioHandler = null;
    this.visualiser = null;
    this.analyser = audioCtx.createAnalyser();
    this.analyser.connect(audioCtx.destination);
    this.analyser.minDecibels = -120;
    this.analyser.maxDecibels = 0;
    this.analyser.smoothingTimeConstant = 0.9;
    this.analyser.fftSize = 2048;

};

App.prototype.loadFile = function() {
    var audioFileUrl = 'sounds/chrono.mp3';

    request = new XMLHttpRequest();
    request.open("GET", audioFileUrl, true);
    request.responseType = "arraybuffer";

    var loader = this;

    // Our asynchronous callback
    request.onload = function() {
        audioCtx.decodeAudioData(
            request.response,
            function(buffer) {
                loader.finishedLoading(buffer);
            },
            function(error) {
                console.error('decodedAudioData error', error);
            });
    };
    request.send();
};

App.prototype.finishedLoading = function(buffer) {
    this.audioHandler = new AudioHandler(this.analyser);
    this.audioHandler.playSound(buffer);
    this.visualiser = new Visualiser(this.analyser);
    this.visualiser.draw();

    this.audioHandler.addBiQuadFilter('highpass', 400);
    //this.audioHandler.addBiQuadFilter()


};


