var ThreeVis = function(analyser) {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.camera, this.scene, this.renderer, this.container, this.stats;
    this.particles, this.particle, this.line, this.count = 0;
    this.mouseX = this.mouseY = 0;
    this.analyser = analyser;
    this.musicData = new Uint8Array(this.analyser.frequencyBinCount);
    this.AMOUNTX = this.AMOUNTY = this.analyser.frequencyBinCount;

    this.init();
    this.animate();
}

/* FUNCTIONS */
ThreeVis.prototype.init = function() {

    //Init 3D scene
    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 500, 1000);

    camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 200;

    scene = new THREE.Scene();

    particles = new Array();

    var PI2 = Math.PI * 2;

    var material = new THREE.SpriteCanvasMaterial({
        color: 0x00000,
        program: function(context) {
            context.beginPath();
            context.arc(0, 0, 0.5, 0, PI2, true);
            context.fill();
        }
    });

    //Create particles
    var program = function ( context ) {
					context.beginPath();
					context.arc( 0, 0, 0.5, 0, PI2, true );
					context.fill();
				};

    var i = 0;
    var SEPARATION = 1;
    var geometry = new THREE.Geometry();


    for (var ix = 0; ix < this.AMOUNTX; ix++) {
        //distribute particles
        particle = particles[i++] = new THREE.Sprite(material);
        particle.position.x = ix * SEPARATION - ((this.AMOUNTX * SEPARATION) / 2);
        particle.scale.x = Math.random() * 0.1;
        particle.scale.y = Math.random() * 0.1;

        //particle.position.z = i * SEPARATION - ( ( this.AMOUNTY * SEPARATION ) / 2 );
        scene.add(particle);
        geometry.vertices.push( particle.position );

    }

    //Create Lines and set material properties
    line = new THREE.Line( geometry, new THREE.LineBasicMaterial( {

      color: 0xffffff,
      opacity: 1,
      linewidth: 3

    }));

    scene.add(line);


    //Create container and set renderer
    renderer = new THREE.CanvasRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //Show FPS from https://github.com/mrdoob/stats.js/
		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
	  this.stats.domElement.style.top = '0px';
    this.stats.domElement.style.right = '0px';
		container.appendChild( this.stats.domElement );

    //Moving camera
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('touchstart', this.onDocumentTouchStart, false);
    document.addEventListener('touchmove', this.onDocumentTouchMove, false);

    window.addEventListener('resize', this.onWindowResize, false);
}

//From http://learningthreejs.com/data/THREEx/docs/THREEx.WindowResize.html
ThreeVis.prototype.onWindowResize = function() {

    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
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

    this.analyser.getByteFrequencyData(this.musicData);
    var timer = Date.now() * 0.0001;


    //camera.position.x = Math.cos( timer ) * 200;
		//camera.position.z = Math.sin( timer ) * 200;
    camera.lookAt( scene.position );
    //camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer.setClearColor(0x00000, 1);

    for (var i = 0; i < this.AMOUNTX; i++) {
        var value = this.musicData[i];
        var percent = value / 256;
        var height = this.windowHalfY * percent;
        var offset = this.windowHalfY - height - 1;
        var barWidth = this.windowHalfX / this.musicData.length;
        //var hue = i / this.musicData.length * 360;
        particle = particles[i];
        particle.position.y = height;

        //particle.scale.y = particle.scale.x = height/100;
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
