'use strict';

/**
 * Audio frequency visualiser
 * @param {AnalyserNode} analyser  Analyser to use
 */
var ThreeVis = function(analyser) {
    this.visHalfWidth = this.visHalfHeight = null;
    this.camera = this.scene = this.renderer = this.container = this.stats = null;
    this.analyser = analyser;
    // frequencyBinCount is half of the fftSize of the analyser
    this.audioData = new Uint8Array(this.analyser.frequencyBinCount);
    this.AMOUNTX = this.AMOUNTY = this.analyser.frequencyBinCount;
    this.clock = new THREE.Clock(true);
    this.tick = 0;
    this.particleSystem = this.options = this.spawnerOptions = null;

    this.init();
    this.animate();
};

/**
 * Initializes the visualiser
 * @return {void}
 */
ThreeVis.prototype.init = function() {

    // Get container element from HTML
    this.container = document.getElementById('visualiser');

    // Set vis dimensions to fit the container
    this.visHalfWidth = this.container.offsetWidth / 2;
    this.visHalfHeight = this.container.offsetHeight / 2;

    this.camera = new THREE.OrthographicCamera(-this.visHalfWidth, this.visHalfWidth, this.visHalfHeight, -this.visHalfHeight, 1, 1000);

    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 200;

    this.scene = new THREE.Scene();

    // The GPU Particle system extends THREE.Object3D, and so you can use it
    // as you would any other scene graph component.  Particle positions will be
    // relative to the position of the particle system, but you will probably only need one
    // system for your whole scene
    this.particleSystem = new THREE.GPUParticleSystem({
        maxParticles: 500000
    });

    this.scene.add(this.particleSystem);

    // Options that are passed to each spawned particle
    this.options = {
        position: new THREE.Vector3(),
        positionRandomness: 0.3,
        velocity: new THREE.Vector3(),
        velocityRandomness: 0.5,
        color: 0xaa88ff,
        colorRandomness: 0.3,
        turbulence: 0.4,
        lifetime: 2,
        size: 5,
        sizeRandomness: 1
    };

    // Options controlling the particle spawner
    this.spawnerOptions = {
        spawnRate: 20000,
        horizontalSpeed: 1.2,
        verticalSpeed: 1.4,
        timeScale: 1
    };


    // Create renderer and set correct size
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer.setClearColor(0x00000, 1);

    // Make the camera look up a bit so that the visualisation doesn't clip.
    var newPos = new THREE.Vector3(0, 100, 0);
    newPos.add(this.scene.position);

    this.camera.lookAt(newPos);

    // Add the renderer to the container
    this.container.appendChild(this.renderer.domElement);

    //Show FPS from https://github.com/mrdoob/stats.js/
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.right = '0px';
    this.container.appendChild(this.stats.domElement);

    // Handle resizing the window
    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    window.console.log("Visualiser loaded.");

};

//From http://learningthreejs.com/data/THREEx/docs/THREEx.WindowResize.html
ThreeVis.prototype.onWindowResize = function() {

    this.visHalfHeight = this.container.offsetHeight / 2;
    this.visHalfWidth = this.container.offsetWidth / 2;

    // Update camera and renderer
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);

};


ThreeVis.prototype.animate = function() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
};

/**
 * Rendering function for the visualiser
 */
ThreeVis.prototype.render = function() {

    // Get audio data at current time
    this.analyser.getByteFrequencyData(this.audioData);

    // Calculate delta and increase tick
    var delta = this.clock.getDelta() * this.spawnerOptions.timeScale;
    this.tick += delta;

    if (this.tick < 0) this.tick = 0;

    if (delta > 0) {

        // Spawn particles at location determined by frequency and amplitude
        for (var i = 0; i < this.AMOUNTX; i++) {
            var value = this.audioData[i];
            var percent = value / 255;
            var height = this.visHalfHeight * percent;
            this.options.position.x = i - ((this.AMOUNTX) / 2);
            this.options.position.y = height;
            this.particleSystem.spawnParticle(this.options);
        }
    }

    this.particleSystem.update(this.tick);

    // Render current content to screen
    this.renderer.render(this.scene, this.camera);
};
