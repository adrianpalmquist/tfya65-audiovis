var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

window.onload = function() {
    var app = new App();
};

var App = function() {

    this.audioHandler = null;
    this.visualiser = null;
    this.analyser = audioCtx.createAnalyser();
    this.analyser.connect(audioCtx.destination);
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;
    this.analyser.smoothingTimeConstant = 0.9;
    this.analyser.fftSize = 2048;

    this.threeVis = new ThreeVis(this.analyser);

    var fileUpload = document.getElementById("fileUpload");
    var temp = this;
    fileUpload.addEventListener("change", function()  {
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
        audioCtx.decodeAudioData(e.target.result, function(buffer) {
            console.log(buffer);
            var array = new Array();
            array[0] = buffer;
            that.finishedLoading(array);
        });
    };
    reader.readAsArrayBuffer(file);
};

App.prototype.loadDefault = function() {

    var that = this;
    var bufferLoader = new BufferLoader(audioCtx, [
        'sounds/chrono.mp3',
        ],
        that.finishedLoading.bind(that)
        );

    bufferLoader.load();
};

App.prototype.finishedLoading = function(bufferList) {

    if (this.audioHandler === null) {
        this.audioHandler = new AudioHandler(this.analyser, bufferList[0]);
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
        });
    } else {
        this.audioHandler.changeBuffer(bufferList[0]);
    }

    //this.visualiser = new Visualiser(this.analyser);
    //this.visualiser.draw();






    //this.audioHandler.addBiQuadFilter('highpass', 1000);
    //this.audioHandler.addBiQuadFilter()

};
