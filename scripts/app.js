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

    var fileUpload = document.getElementById("fileUpload");
    var temp = this;
    fileUpload.addEventListener("change", function()  {
        temp.loadUploadedFile(fileUpload.value);
    });


};

App.prototype.loadUploadedFile = function(file) {
    var reader = new FileReader();
    var that = this;
    reader.onload = function(e) {
        that.finishedLoading(e.target.result);
    };
    reader.readAsArrayBuffer(e.target.files[0]);
};

App.prototype.loadDefault = function() {

    var that = this;
    var bufferLoader = new BufferLoader(audioCtx, [
            '../sounds/chrono.mp3',
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
    toggle.addEventListener("click", function() {
        tempAudio.togglePlayback();
        if (toggle.textContent == "Play")
            toggle.textContent = "Pause";
        else
            toggle.textContent = "Play";

        //tempVis.toggleDraw();
    });

    //this.audioHandler.addBiQuadFilter('highpass', 1000);
    //this.audioHandler.addBiQuadFilter()

};
