function main() {
  var stats = initStats();          // To show FPS information
  var scene = new THREE.Scene();    // Create main scene
  var renderer = initRenderer();    // View function in util/utils
  var camera = initCamera(new THREE.Vector3(0, -40, 25)); // Init camera in this position

  // Enable mouse rotation, pan, zoom etc.
  var trackballControls = new THREE.TrackballControls(camera, renderer.domElement);


  var posicao = new THREE.Vector3(10.0, 15.0, 3);
  var x = y = 0;
  var z = 3
  var animationOn = false; // control if animation is on or of

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


    if (animationOn) {
      var mat4 = new THREE.Matrix4();
      posicao.x = x
      posicao.y = y
      posicao.z = z
      sphere.position.set(x, y, z);

      // sphere.matrix.multiply(mat4.makeTranslation(x, y, z)); // T1
    }
  }

  function buildInterface() {
    var controls = new function () {
      this.onChangeAnimation = function () {
        if (!animationOn) animationOn = !animationOn;
      };
      this.speed = 0.05;

      this.x = 0.0;
      this.y = 0.0;
      this.z = 3.0;

      this.changeSpeed = function () {
        speed = this.speed;
      };

      this.changeX = function () {
        x = this.x;
      }

      this.changeY = function () {
        y = this.y;
      }

      this.changeZ = function () {
        z = this.z;
      }
    };

    // GUI interface
    var gui = new dat.GUI();
    gui.add(controls, 'onChangeAnimation', true)
      .name('Animation On/Off');
    gui.add(controls, 'x', -25, 25)
      .onChange(function (e) {
        controls.changeX()
      })
      .name('Mude o valor x')
    gui.add(controls, 'y', -25, 25)
      .onChange(function (e) {
        controls.changeY()
      })
      .name('Mude o valor y')
    gui.add(controls, 'z', 0, 25)
      .onChange(function (e) {
        controls.changeZ()
      })
      .name('Mude o valor z');
  }


  function render() {
    stats.update(); // Update FPS
    movendoEsfera();
    trackballControls.update(); // Enable mouse movements
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
  }
}
