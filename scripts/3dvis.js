var ThreeVis = function(analyser) {


    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.container;
    this.camera, this.scene, this.renderer;
    this.particles, this.particle, this.count = 0;
    this.mouseX = this.mouseY = 0;
    this.analyser = analyser;
    this.musicData = new Uint8Array(this.analyser.frequencyBinCount);
    this.AMOUNTX = this.AMOUNTY = this.analyser.frequencyBinCount;

    this.init();
    this.animate();

}

/* FUNCTIONS */
ThreeVis.prototype.init = function() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 300;
    camera.position.x = 0;
    camera.position.y = 0

    scene = new THREE.Scene();

    particles = new Array();

    var PI2 = Math.PI * 2;
    var material = new THREE.SpriteCanvasMaterial({

        color: 0xfffff,
        program: function(context) {

            context.beginPath();
            context.arc(0, 0, 0.5, 0, PI2, true);
            context.fill();
        }
    });

    //Create particles
    var i = 0;
    var SEPARATION = 1;

    for (var ix = 0; ix < this.AMOUNTX; ix++) {
        particle = particles[i++] = new THREE.Sprite(material);
        particle.position.x = ix * SEPARATION - ((this.AMOUNTX * SEPARATION) / 2);
        particle.scale.x = 2;
        particle.scale.y = 2;
        //particle.position.z = iy * SEPARATION - ( ( this.AMOUNTY * SEPARATION ) / 2 );
        scene.add(particle);

    }


    //Create container and set renderer
    renderer = new THREE.CanvasRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //Moving camera
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('touchstart', this.onDocumentTouchStart, false);
    document.addEventListener('touchmove', this.onDocumentTouchMove, false);

    window.addEventListener('resize', this.onWindowResize, false);
}

//From http://learningthreejs.com/data/THREEx/docs/THREEx.WindowResize.html
ThreeVis.prototype.onWindowResize = function() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

ThreeVis.prototype.onDocumentMouseMove = function(event) {

    mouseX = event.clientX - this.windowHalfX;
    mouseY = event.clientY - this.windowHalfY;
}

ThreeVis.prototype.onDocumentTouchStart = function(event) {

    if (event.touches.length === 1) {

        event.preventDefault();

        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}

ThreeVis.prototype.onDocumentTouchMove = function(event) {

    if (event.touches.length === 1) {

        event.preventDefault();

        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}

ThreeVis.prototype.animate = function() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
}

ThreeVis.prototype.render = function() {

    this.analyser.getByteFrequencyData(this.musicData);

    //camera.lookAt( scene.position );
    camera.lookAt(new THREE.Vector3(0, 50, 0));

    renderer.setClearColor(0x007cbc, 1);

    for (var i = 0; i < this.AMOUNTX; i++) {
        var value = this.musicData[i];
        var percent = value / 256;
        var height = this.windowHalfY * percent;
        var offset = this.windowHalfY - height - 1;
        var barWidth = this.windowHalfX / this.musicData.length;
        //var hue = i / this.musicData.length * 360;
        particle = particles[i];
        particle.position.y = height;
    }

    // var j = 0;
    // for ( var ix = 0; ix < this.AMOUNTX; ix ++ ) {
    // 	for ( var iy = 0; iy < this.AMOUNTY; iy ++ ) {
    // 	  particle = particles[j++];
    // 		particle.position.y = 1;
    //     particle.scale.x = 1;
    // 		particle.scale.y = 1;
    //   }
    // }

    renderer.render(scene, camera);
}
