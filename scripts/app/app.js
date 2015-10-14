"use strict";

// Create the AudioContext to use in the app
var audioCtx = new window.AudioContext();

// Load app when everything else has loaded
window.onload = function() {
    var app = new App();
    app.loadDefault();
};

/**
 * Audio visualiser. Uses Web Audio API and Three.js
 * Initializes values and starts listening to the UI
 */
var App = function() {

    this.audioHandler = null;
    this.threeVis = null;
    this.analyser = audioCtx.createAnalyser();
    this.analyser.connect(audioCtx.destination);
    this.analyser.minDecibels = -100;
    this.analyser.maxDecibels = -20;
    this.analyser.smoothingTimeConstant = 0.9;
    this.analyser.fftSize = 2048;

    // Listen to the browse button
    var fileUpload = document.getElementById("fileUpload");
    var self = this;
    fileUpload.addEventListener("change", function()  {
        self.loadUploadedFile(fileUpload.files[0]);
    });

    // Listen to the default button
    var loadDefaultBtn = document.getElementById("loadDefaultBtn");
    loadDefaultBtn.addEventListener("click", function() {
        self.loadDefault();
    });


};

/**
 * Load a user uploaded file
 * @param  {File} file      The uploaded file
 */
App.prototype.loadUploadedFile = function(file) {
    var reader = new FileReader();
    var that = this;
    reader.onload = function(e) {
        // If flac, use aurora.js and flac.js to decode
        if (file.type === "audio/flac") {
            var asset = AV.Asset.fromBuffer(e.target.result);

            /*
                Decode the flac file to a Float32Array containing interleaved
                PCM audio and pass it to the specified function
             */
            asset.decodeToBuffer(function(buffer) {
                window.console.log("Audio decoded.");
                /* Copy the interleaved PCM audio from the Float32Array to a new AudioBuffer */
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

        // Else use the AudioContext to decode. Supported formats depends on the browser
        } else {
            audioCtx.decodeAudioData(e.target.result, function(buffer) {
                window.console.log("Audio decoded.");
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

/**
 * Handles the decoded AudioBuffers.
 * Sets up the AudioHandler and visualiser the first time the function is called.
 * Also sets up the play button listener.
 * A bit flawed to do it this way, but hey, it works
 * 
 * @param  {Array} bufferList      Array containing the AudioBuffers
 * @return {void}
 */
App.prototype.finishedLoading = function(bufferList) {

    if (this.audioHandler === null) {
        this.audioHandler = new AudioHandler(this.analyser, bufferList[0]);
        var tempAudio = this.audioHandler;
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

};
