var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

window.onload = function() {
    var app = new App();
    app.loadFile();

};

var App = function() {

    this.audioHandler = null;
    this.visualiser = null;
    this.threeVis = null;
    this.analyser = audioCtx.createAnalyser();
    this.analyser.connect(audioCtx.destination);
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;
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
    //this.visualiser = new Visualiser(this.analyser);
    //this.visualiser.draw();
    this.threeVis = new ThreeVis(this.analyser);


    var tempAudio = this.audioHandler;
    var tempVis = this.visualiser;
    var toggle = document.getElementById("toggle");
    toggle.addEventListener("click", function() {
        tempAudio.togglePlayback();
        //tempVis.toggleDraw();
    });

    //this.audioHandler.addBiQuadFilter('highpass', 1000);
    //this.audioHandler.addBiQuadFilter()

};
