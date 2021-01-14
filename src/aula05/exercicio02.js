function main() {
  var stats = initStats();          // To show FPS information
  var scene = new THREE.Scene();    // Create main scene
  var renderer = initRenderer();    // View function in util/utils
  var camera = initCamera(new THREE.Vector3(0, -80, 45)); // Init camera in this position

  // Enable mouse rotation, pan, zoom etc.
  var trackballControls = new THREE.TrackballControls(camera, renderer.domElement);


  var x = 0;
  var y = 0;
  var z = 3
  var frames = 30;
  var steps = [0, 0., 0., 0.]
  var moverOn = false; // control if animation is on or of

  // Show axes (parameter is size of each axis)
  var axesHelper = new THREE.AxesHelper(12);
  scene.add(axesHelper);

  // create the ground plane
  var planeGeometry = new THREE.PlaneGeometry(40, 40);
  planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
  var planeMaterial = new THREE.MeshBasicMaterial({
    color: 'rgba(150, 150, 150)',
    side: THREE.DoubleSide,
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // add the plane to the scene
  scene.add(plane);

  // create a sphere
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    new THREE.MeshNormalMaterial(),
  );
  // position the cube
  sphere.position.set(10.0, 15.0, 3);
  // add the sphere to the scene
  scene.add(sphere);

  // Listen window size changes
  window.addEventListener('resize', function () {
    onWindowResize(camera, renderer)
  }, false);

  buildInterface();
  render();

  function movendoEsfera() {


    if (moverOn) {
      if (steps[0] >= frames) {
        moverOn = false;
        return;
      }

      steps[0] += 1;

      sphere.position.x += steps[1];
      sphere.position.y += steps[2];
      sphere.position.z += steps[3];
    }
  }

  function buildInterface() {
    var controls = new function () {
      this.onChangeAnimation = function () {
        if (!moverOn) {
          moverOn = !moverOn;

          steps[0] = 0
          steps[1] = (x - sphere.position.x) / frames;
          steps[2] = (y - sphere.position.y) / frames;
          steps[3] = (z - sphere.position.z) / frames;
        }
      };
      this.frames = 30;

      this.x = 0.0;
      this.y = 0.0;
      this.z = 3.0;

      this.changeX = function () {
        x = this.x;
      }

      this.changeY = function () {
        y = this.y;
      }

      this.changeZ = function () {
        z = this.z;
      }

      this.changeFrames = function () {
        frames = this.frames;
      }
    };

    // GUI interface
    var gui = new dat.GUI();
    gui.add(controls, 'x', -25, 25)
      .onChange(function (e) {
        controls.changeX()
      })
      .name('Mude o valor x');
    gui.add(controls, 'y', -25, 25)
      .onChange(function (e) {
        controls.changeY()
      })
      .name('Mude o valor y');
    gui.add(controls, 'z', 0, 25)
      .onChange(function (e) {
        controls.changeZ()
      })
      .name('Mude o valor z');
    gui.add(controls, 'frames', 30, 120)
      .onChange(function (e) {
        controls.changeFrames()
      })
      .name('frames');
    gui.add(controls, 'onChangeAnimation', moverOn)
      .name('Mover');
  }


  function render() {
    stats.update(); // Update FPS
    movendoEsfera();
    trackballControls.update(); // Enable mouse movements
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
  }
}
