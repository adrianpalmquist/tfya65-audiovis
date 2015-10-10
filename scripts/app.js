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

    var that = this;
    var bufferLoader = new BufferLoader(audioCtx, [
            '../sounds/chrono.mp3',
            '../sounds/church.mp3',
        ],
        that.finishedLoading.bind(that)
    );

    bufferLoader.load();
};

App.prototype.finishedLoading = function(bufferList) {

    this.audioHandler = new AudioHandler(this.analyser, bufferList);
    //this.visualiser = new Visualiser(this.analyser);
    //this.visualiser.draw();
    this.threeVis = new ThreeVis(this.analyser);


    var tempAudio = this.audioHandler;
    var tempVis = this.visualiser;
    var toggle = document.getElementById("toggle");
    var togglespan = document.getElementById("togglespan");
    toggle.addEventListener("click", function() {
        tempAudio.togglePlayback();
        if(togglespan.className == "glyphicon glyphicon-play")
            togglespan.className = "glyphicon glyphicon-pause";
        else
            togglespan.className = "glyphicon glyphicon-play";

                //tempVis.toggleDraw();
            });

    //this.audioHandler.addBiQuadFilter('highpass', 1000);
    //this.audioHandler.addBiQuadFilter()

};
