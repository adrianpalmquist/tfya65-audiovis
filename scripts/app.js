"use strict";

var audioCtx = new window.AudioContext();

window.onload = function() {
    var app = new App();
    app.loadDefault();
};

var App = function() {

    this.audioHandler = null;
    this.visualiser = null;
    this.analyser = audioCtx.createAnalyser();
    this.analyser.connect(audioCtx.destination);
    this.analyser.minDecibels = -100;
    this.analyser.maxDecibels = -20;
    this.analyser.smoothingTimeConstant = 0.9;
    this.analyser.fftSize = 2048;

    this.threeVis = null;

    var fileUpload = document.getElementById("fileUpload");
    var temp = this;
    fileUpload.addEventListener("change", function()  {
        window.console.log(fileUpload.files[0]);
        temp.loadUploadedFile(fileUpload.files[0]);
    });

    var loadDefaultBtn = document.getElementById("loadDefaultBtn");
    loadDefaultBtn.addEventListener("click", function() {
        temp.loadDefault();
    });


};

App.prototype.loadUploadedFile = function(file) {
    var reader = new FileReader();
    var that = this;
    reader.onload = function(e) {
        if (file.type === "audio/flac") {
            var asset = AV.Asset.fromBuffer(e.target.result);

            asset.decodeToBuffer(function(buffer) {
                var audioBuffer = audioCtx.createBuffer(2, buffer.length, audioCtx.sampleRate);
                var leftChannel = audioBuffer.getChannelData(0);
                var rightChannel = audioBuffer.getChannelData(1);
                var inputIndex = 0;
                for (var i = 0; i < buffer.length;) {
                    leftChannel[inputIndex] = buffer[i++];
                    rightChannel[inputIndex] = buffer[i++];
                    inputIndex++;
                }
                var array = [];
                array[0] = audioBuffer;
                that.finishedLoading(array);
            });
        } else {
            audioCtx.decodeAudioData(e.target.result, function(buffer) {
                window.console.log(buffer);
                var array = [];
                array[0] = buffer;
                that.finishedLoading(array);
            });
        }

    };
    reader.readAsArrayBuffer(file);
};

App.prototype.loadDefault = function() {

    var that = this;
    var bufferLoader = new BufferLoader(audioCtx, [
            "sounds/chrono.mp3",
        ],
        that.finishedLoading.bind(that)
    );

    bufferLoader.load();
};

App.prototype.finishedLoading = function(bufferList) {

    if (this.audioHandler === null) {
        this.audioHandler = new AudioHandler(this.analyser, bufferList[0]);
        var tempAudio = this.audioHandler;
        //tempAudio.addGainNode();
        this.threeVis = new ThreeVis(this.analyser);
        var toggle = document.getElementById("toggle");
        var togglespan = document.getElementById("togglespan");
        toggle.addEventListener("click", function() {
            tempAudio.togglePlayback();
            if (togglespan.className == "glyphicon glyphicon-play")
                togglespan.className = "glyphicon glyphicon-pause";
            else
                togglespan.className = "glyphicon glyphicon-play";
        });
    } else {
        this.audioHandler.changeBuffer(bufferList[0]);
    }

    //this.visualiser = new Visualiser(this.analyser);
    //this.visualiser.draw();






    //this.audioHandler.addBiQuadFilter('highpass', 1000);
    //this.audioHandler.addBiQuadFilter()

};
