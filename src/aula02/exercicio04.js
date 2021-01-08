function main()
{
  var stats = initStats();          // To show FPS information
  var scene = new THREE.Scene();    // Create main scene
  var renderer = initRenderer();  
  var posicao = new THREE.Vector3( 0, -30, 15 );  // View function in util/utils
  var camera = initCamera(posicao); // Init camera in this position
  var clock = new THREE.Clock();
  var aponta = new THREE.Vector3( 0, 0, 0 );
  var up = new THREE.Vector3( 0, 0, 1 );

  // Show text information onscreen
  showInformation();
  var secondaryMsg = new SecondaryBox()

  // To use the keyboard
  var keyboard = new KeyboardState(`Up : ${up.x} ${up.y} ${up.z} Position : ${posicao.x} ${posicao.y} ${posicao.z} Point: ${aponta.x} ${aponta.y} ${aponta.z}`);

  // Enable mouse rotation, pan, zoom etc.
  var trackballControls = new THREE.TrackballControls(camera, renderer.domElement );

  // Show axes (parameter is size of each axis)
  var axesHelper = new THREE.AxesHelper( 12 );
  scene.add( axesHelper );

  // create the ground plane
  var planeGeometry = new THREE.PlaneGeometry(20, 20);
  planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
  var planeMaterial = new THREE.MeshBasicMaterial({
      color: "rgb(150, 150, 150)",
      side: THREE.DoubleSide
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // add the plane to the scene
  scene.add(plane);

  // create a cube
  var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
  var cubeMaterial = new THREE.MeshNormalMaterial();
  var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  // position the cube
  cube.position.set(0.0, 0.0, 2.0);
  // add the cube to the scene
  scene.add(cube);

  // Listen window size changes
  window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

  render();

  function changeCamera() {

    keyboard.update();

    var speed = 10;
    var p = speed * clock.getDelta();

    var angle = 0;

    // Alterando a posição em x e z
    if ( keyboard.pressed("up") )  posicao.z += p;
    if ( keyboard.pressed("down") )  posicao.z -= p;
    if ( keyboard.pressed("left") )  posicao.x -= p;
    if ( keyboard.pressed("right") )  posicao.x += p;

    // Modificando para onde a câmera aponta
    if ( keyboard.pressed("D")) aponta.x += p;
    if ( keyboard.pressed("A")) aponta.x -= p;
    if ( keyboard.pressed("W")) aponta.z += p;
    if ( keyboard.pressed("S")) aponta.z -= p;

    // Modificando o vetor up
    if (keyboard.pressed("Q")) {
      angle += 0.01;
      up.x += Math.sin( angle );
      up.z += 1 - Math.cos( angle );
    }
    if (keyboard.pressed("E")) {
      angle -= 0.01;
      up.x += Math.sin( angle );
      up.z += 1 - Math.cos( angle );
    }

    if(keyboard.pressed("space")){
      posicao = new THREE.Vector3( 0, -30, 15 );
      aponta = new THREE.Vector3( 0, 0, 0 );
      up = new THREE.Vector3( 0, 0, 1 );
    }

    secondaryMsg.changeMessage(`Up : ${up.x} ${up.y} ${up.z} Position : ${posicao.x} ${posicao.y} ${posicao.z} Point: ${aponta.x} ${aponta.y} ${aponta.z}`)

    camera.position.copy(posicao);
    camera.lookAt(aponta);
    camera.up.copy(up);
  }

  function showInformation()
  {
    // Use this to show information onscreen
    controls = new InfoBox();
      controls.add("Keyboard Example");
      controls.addParagraph();
      controls.add("Press WASD keys to move continuously");
      controls.add("Press arrow keys to move in discrete steps");
      controls.add("Press SPACE to put the cube in its original position");
      controls.show();
  }

  function render()
  {
    stats.update(); // Update FPS
    requestAnimationFrame(render); // Show events
    trackballControls.update();
    changeCamera();
    renderer.render(scene, camera) // Render scene
  }
}
