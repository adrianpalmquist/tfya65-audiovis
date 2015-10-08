var Visualiser = function(analyser) {
    this.WIDTH = 640;
    this.HEIGHT = 360;
    this.intendedWidth = document.querySelector('.wrapper').clientWidth;
    this.analyser = analyser;
    this.musicData = new Uint8Array(this.analyser.frequencyBinCount);
    this.canvas = document.querySelector('.visualiser');
    this.canvasCtx = this.canvas.getContext("2d");
    this.isPlaying = true;
    this.animationId;

};
Visualiser.prototype.toggleDraw = function() {
    if (this.isPlaying) {
        cancelAnimationFrame(this.animationId);
    } else {
        this.draw();
    }

    this.isPlaying = !this.isPlaying;

}

Visualiser.prototype.draw = function() {

    this.analyser.getByteFrequencyData(this.musicData);
    //analyser.getByteTimeDomainData(musicData);

    //var width = Math.floor(1 / musicData.length, 10);

    this.canvas.width = this.WIDTH;
    this.canvas.height = this.HEIGHT;

    for (var i = 0; i < this.musicData.length; i++) {
        var value = this.musicData[i];
        var percent = value / 256;
        var height = this.HEIGHT * percent;
        var offset = this.HEIGHT - height - 1;
        var barWidth = this.WIDTH / this.musicData.length;
        var hue = i / this.musicData.length * 360;
        this.canvasCtx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
        this.canvasCtx.fillRect(i * barWidth, offset, barWidth, height);
    }
    this.animationId = requestAnimationFrame(this.draw.bind(this));
};
