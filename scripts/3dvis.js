var ThreeVis = function(analyser) {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.camera, this.scene, this.renderer, this.container, this.stats;
    this.particles, this.particle, this.line, this.count = 0;
    this.mouseX = this.mouseY = 0;
    this.analyser = analyser;
    this.musicData = new Uint8Array(this.analyser.frequencyBinCount);
    this.AMOUNTX = this.AMOUNTY = this.analyser.frequencyBinCount;
    clock = new THREE.Clock(true);
    tick = 0;

    this.init();
    this.animate();
}

/* FUNCTIONS */
ThreeVis.prototype.init = function() {

    //Init 3D Scene

    container = document.getElementById('visualiser');

    this.windowHalfX = container.offsetWidth / 2;
    this.windowHalfY = container.offsetHeight / 2;

    camera = new THREE.OrthographicCamera(-this.windowHalfX, this.windowHalfX, this.windowHalfY, -this.windowHalfY, 1, 1000);

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 200;

    scene = new THREE.Scene();

    // The GPU Particle system extends THREE.Object3D, and so you can use it
    // as you would any other scene graph component.  Particle positions will be
    // relative to the position of the particle system, but you will probably only need one
    // system for your whole scene
    particleSystem = new THREE.GPUParticleSystem({
        maxParticles: 900000

    });
    scene.add(particleSystem);

    // options passed during each spawned
    options = {
        position: new THREE.Vector3(),
        positionRandomness: .0,
        velocity: new THREE.Vector3(),
        velocityRandomness: .0,
        color: 0x158658,
        colorRandomness: 0*Math.random(),
        turbulence: .0,
        lifetime: 1,
        size: 8,
        sizeRandomness: 3
    };

    spawnerOptions = {
        spawnRate: 10000,
        horizontalSpeed: 1.5,
        verticalSpeed: 1.33,
        timeScale: 1
    }


    //Create container and set renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x00000, 1);


    camera.lookAt(scene.position);

    container.appendChild(renderer.domElement);

    //Show FPS from https://github.com/mrdoob/stats.js/
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.right = '0px';
    container.appendChild(this.stats.domElement);

    //Moving camera
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('touchstart', this.onDocumentTouchStart, false);
    document.addEventListener('touchmove', this.onDocumentTouchMove, false);

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
}

//From http://learningthreejs.com/data/THREEx/docs/THREEx.WindowResize.html
ThreeVis.prototype.onWindowResize = function() {

    this.windowHalfY = container.offsetHeight / 2;
    this.windowHalfX = container.offsetWidth / 2;

    //Set camera aspect ratio and update Projection Matrix
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);


}

ThreeVis.prototype.onDocumentMouseMove = function(event) {
    this.mouseX = event.clientX - this.windowHalfX;
    this.mouseY = event.clientY - this.windowHalfY;
}

ThreeVis.prototype.onDocumentTouchStart = function(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        this.mouseX = event.touches[0].pageX - this.windowHalfX;
        this.mouseY = event.touches[0].pageY - this.windowHalfY;
    }
}

ThreeVis.prototype.onDocumentTouchMove = function(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        this.mouseX = event.touches[0].pageX - this.windowHalfX;
        this.mouseY = event.touches[0].pageY - this.windowHalfY;
    }
}

ThreeVis.prototype.animate = function() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
}

ThreeVis.prototype.render = function() {

    //Get Music Data
    this.analyser.getByteFrequencyData(this.musicData);
    camera.zoom = 30;
    camera.updateProjectionMatrix();
    var timer = Date.now() * 0.0001;

		//camera.position.x = Math.cos( timer ) * 200;
	  //camera.position.z = Math.sin( timer ) * 200;
    //camera.position.y = Math.sin( timer ) * 200;

    var d = new Date();
    var n = d.getTime();
    var minutes = 1000 * 60;
    var y = Math.round(n / minutes);

    var delta = clock.getDelta() * spawnerOptions.timeScale;
    tick += delta;

    camera.zoom = 2;
    camera.updateProjectionMatrix();

    if (tick < 0) tick = 0;

    if (delta > 0) {

        for (var i = 0; i < this.AMOUNTX; i++) {

            var value = this.musicData[i];
            var percent = value / 255;
            var height = this.windowHalfY * percent;
            //options.position.x = Math.random() * 30 - 1;;
            //options.position.y = height;

            //options.position.normalize();
            //options.position.multiplyScalar( Math.random() * 5 + 450 );

            options.position.x =   (Math.random() * 2.5 - 1)*height*tick;
            options.position.y = -((Math.random() * 1.4 - 1)*height);
            //options.position.z = (Math.random() * 1  - 1);

            options.position.normalize();
            options.position.multiplyScalar((height));

            particleSystem.spawnParticle(options);
        }
    }

    particleSystem.update(tick);

    renderer.render(scene, camera);
}
