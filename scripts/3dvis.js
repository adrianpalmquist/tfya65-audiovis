'use strict';

var ThreeVis = function(analyser) {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.camera = this.scene = this.renderer = this.container = this.stats = null;
    this.analyser = analyser;
    this.musicData = new Uint8Array(this.analyser.frequencyBinCount);
    this.AMOUNTX = this.AMOUNTY = this.analyser.frequencyBinCount;
    this.clock = new THREE.Clock(true);
    this.tick = 0;
    this.particleSystem = this.options = this.spawnerOptions = null;

    this.init();
    this.animate();
};

/* FUNCTIONS */
ThreeVis.prototype.init = function() {

    //Init 3D Scene

    this.container = document.getElementById('visualiser');

    this.windowHalfX = this.container.offsetWidth / 2;
    this.windowHalfY = this.container.offsetHeight / 2;

    this.camera = new THREE.OrthographicCamera(-this.windowHalfX, this.windowHalfX, this.windowHalfY, -this.windowHalfY, 1, 1000);

    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 200;

    this.scene = new THREE.Scene();

    // The GPU Particle system extends THREE.Object3D, and so you can use it
    // as you would any other scene graph component.  Particle positions will be
    // relative to the position of the particle system, but you will probably only need one
    // system for your whole scene
<<<<<<< HEAD
    this.particleSystem = new THREE.GPUParticleSystem({
        maxParticles: 250000
=======
    particleSystem = new THREE.GPUParticleSystem({
        maxParticles: 500000
>>>>>>> 4598b8ed1c62068d36469c5c2c875fd817df1ff2
    });

    this.scene.add(this.particleSystem);

    // options passed during each spawned
    this.options = {
        position: new THREE.Vector3(),
        positionRandomness: 0.3,
        velocity: new THREE.Vector3(),
        velocityRandomness: 0.5,
        color: 0xaa88ff,
<<<<<<< HEAD
        colorRandomness: 0.2,
        turbulence: 0.4,
        lifetime: 1,
        size: 6,
        sizeRandomness: 1
    };

    this.spawnerOptions = {
        spawnRate: 10000,
        horizontalSpeed: 1.5,
        verticalSpeed: 1.33,
=======
        colorRandomness: .3,
        turbulence: .5,
        lifetime: 2,
        size: 5,
        sizeRandomness: 1
    };

    spawnerOptions = {
        spawnRate: 20000,
        horizontalSpeed: 1.2,
        verticalSpeed: 1.5,
>>>>>>> 4598b8ed1c62068d36469c5c2c875fd817df1ff2
        timeScale: 1
    };


    //Create container and set renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer.setClearColor(0x00000, 1);


    this.camera.lookAt(this.scene.position);

    this.container.appendChild(this.renderer.domElement);

    //Show FPS from https://github.com/mrdoob/stats.js/
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.right = '0px';
    this.container.appendChild(this.stats.domElement);

    //Moving camera
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('touchstart', this.onDocumentTouchStart, false);
    document.addEventListener('touchmove', this.onDocumentTouchMove, false);

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
};

//From http://learningthreejs.com/data/THREEx/docs/THREEx.WindowResize.html
ThreeVis.prototype.onWindowResize = function() {

    this.windowHalfY = this.container.offsetHeight / 2;
    this.windowHalfX = this.container.offsetWidth / 2;

    //Set camera aspect ratio and update Projection Matrix
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);


};

ThreeVis.prototype.onDocumentMouseMove = function(event) {
    this.mouseX = event.clientX - this.windowHalfX;
    this.mouseY = event.clientY - this.windowHalfY;
};

ThreeVis.prototype.onDocumentTouchStart = function(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        this.mouseX = event.touches[0].pageX - this.windowHalfX;
        this.mouseY = event.touches[0].pageY - this.windowHalfY;
    }
};

ThreeVis.prototype.onDocumentTouchMove = function(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        this.mouseX = event.touches[0].pageX - this.windowHalfX;
        this.mouseY = event.touches[0].pageY - this.windowHalfY;
    }
};

ThreeVis.prototype.animate = function() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
};

ThreeVis.prototype.render = function() {

    //Get Music Data
    this.analyser.getByteFrequencyData(this.musicData);

    var delta = this.clock.getDelta() * this.spawnerOptions.timeScale;
    this.tick += delta;

    if (this.tick < 0) this.tick = 0;

    if (delta > 0) {

        for (var i = 0; i < this.AMOUNTX; i++) {
            var value = this.musicData[i];
            var percent = value / 255;
            var height = this.windowHalfY * percent;
            this.options.position.x = i - ((this.AMOUNTX) / 2);
            this.options.position.y = height;
            this.particleSystem.spawnParticle(this.options);
        }
    }

    this.particleSystem.update(this.tick);

    this.renderer.render(this.scene, this.camera);
};
