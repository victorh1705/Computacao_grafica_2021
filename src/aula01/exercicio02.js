function main() {
  var stats = initStats();          // To show FPS information
  var scene = new THREE.Scene();    // Create main scene
  var renderer = initRenderer();    // View function in util/utils
  var camera = initCamera(new THREE.Vector3(0, -40, 25)); // Init camera in this position

  // Enable mouse rotation, pan, zoom etc.
  var trackballControls = new THREE.TrackballControls(camera, renderer.domElement);

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

  // create a cube
  var cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 4),
    new THREE.MeshNormalMaterial(),
  );
  // position the cube
  cube1.position.set(0.0, 0.0, 2.0);
  // add the cube to the scene
  scene.add(cube1);

  // create a sphere
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    new THREE.MeshNormalMaterial(),
  );
  // position the cube
  sphere.position.set(10.0, 15.0, 3);
  // add the sphere to the scene
  scene.add(sphere);

  // create a cylinder
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 10, 32),
    new THREE.MeshNormalMaterial(),
  );
  // position the cylinder
  cylinder.position.set(-15.0, 7.0, 5);
  cylinder.rotateX(1.57)
  // add the cylinder to the scene
  scene.add(cylinder);

  // Use this to show information onscreen
  controls = new InfoBox();
  controls.add('Basic Scene');
  controls.addParagraph();
  controls.add('Use mouse to interact:');
  controls.add('* Left button to rotate');
  controls.add('* Right button to translate (pan)');
  controls.add('* Scroll to zoom in/out.');
  controls.show();

  // Listen window size changes
  window.addEventListener('resize', function () {
    onWindowResize(camera, renderer)
  }, false);

  render();

  function render() {
    stats.update(); // Update FPS
    trackballControls.update(); // Enable mouse movements
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
  }
}
