function main()
{
  var stats = initStats();          // To show FPS information
  var scene = new THREE.Scene();    // Create main scene
  var renderer = initRenderer();    // View function in util/utils
  var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position
  var clock = new THREE.Clock();

  // Use to scale the cube
  var scale   = 1.0;
  var sc = 0; // velocidade do carro
  var anglecarro = 0;
  var ac = 1; // aceleração do carro
  var desloc = 0;
  // var d = Clock.getDelta();
  var d = 0.03;

  // Show text information onscreen
  showInformation();

  // To use the keyboard
  var keyboard = new KeyboardState();

  // Enable mouse rotation, pan, zoom etc.
  var trackballControls = new THREE.TrackballControls( camera, renderer.domElement );

  // Show axes (parameter is size of each axis)
  var axesHelper = new THREE.AxesHelper( 12 );
  scene.add( axesHelper );

  // create the ground plane
  var planeGeometry = new THREE.PlaneGeometry(200, 200);
  planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
  var planeMaterial = new THREE.MeshBasicMaterial({
    color: "rgb(150, 150, 150)",
    side: THREE.DoubleSide
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // add the plane to the scene
  scene.add(plane);

  // create a cube
  var cubeGeometry = new THREE.CylinderGeometry(4, 4, 4);
  var cubeMaterial = new THREE.MeshNormalMaterial();
  var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  // position the cube
  cube.position.set(0.0, 0.0, 2.0);
  // add the cube to the scene
  //scene.add(cube);

  // === Início da Criação do Carro ==


  // Corpo
  var p1 = createCube(8,3,1);
  scene.add(p1);
  p1.position.set(2,0,1);

  // Corpo meio
  var p4 = createCube(2,5,1);
  p1.add(p4);
  p4.position.set(1,0,0);

  // Proteção da frente
  var p2 = createCube(2,5,1);
  p1.add(p2);
  p2.position.set(-3,0,0);

  // Plano base do carro
  var p3 = createCube(2,5,1);
  p1.add(p3);
  p3.position.set(5,0,0);

  
  // vermelho, verde e azul (x,y,z)
  // Criação do Eixo da frente
  var c1 = createCylinder(0.3,6);
  p1.add(c1);
  c1.position.set(-2, 0, 0);

  var c2 = createCylinder(1,1);
  c2.position.set(0, 3.0, 0);
  c1.add(c2);

  var c3 = createCylinder(1,1);
  c1.add(c3);
  c3.position.set(0, -3.0, 0);

  // Criação do Eixo traseiro
  var c4 = createCylinder(0.3,6);
  p1.add(c4);
  c4.position.set(4, 0, 0);

  var c5 = createCylinder(1,1);
  c5.position.set(0, 3.0, 0);
  c4.add(c5);

  var c6 = createCylinder(1,1);
  c6.position.set(0, -6, 0);
  c5.add(c6);

  var cubeAxesHelper = new THREE.AxesHelper(9);
  cube.add(cubeAxesHelper);

  // Listen window size changes
  window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

  render();

  function createCube(x, y, z)
  {
    // largura, profundidade e altura
    const geometry = new THREE.BoxGeometry(x,y,z);
    const material = new THREE.MeshNormalMaterial( {color: 0x00ff00} );
    const cube = new THREE.Mesh( geometry, material );
    return cube;
  }

  function createCylinder(d,l)
  {
    // diamentro,diametro,largura
    const geometry = new THREE.CylinderGeometry( d, d, l, 32 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    const cylinder = new THREE.Mesh( geometry, material );
    return cylinder;
  }
  function acelera()
  {
    // More info:
    // https://threejs.org/docs/#manual/en/introduction/Matrix-transformations
    p1.matrixAutoUpdate = true;
    c1.matrixAutoUpdate = false;
    c4.matrixAutoUpdate = false;

    var mat4 = new THREE.Matrix4();

    p1.matrix.identity();  // reset matrix
    c1.matrix.identity();  // reset
    c4.matrix.identity();

    // Ajustes
    p1.matrix.multiply(mat4.makeTranslation(0.0,0.0,1.0));
    c1.matrix.multiply(mat4.makeTranslation(-2.0,0.0,0));
    c4.matrix.multiply(mat4.makeTranslation(4.0,0.0,0.0));


    // deslocamento Progressivo
    //cylinder.matrix.multiply(mat4.makeRotationZ(angle)); // R1
    //p1.matrix.multiply(mat4.makeTranslation(meucu, 0, 0));

    // Ângulo do carro
    p1.matrix.multiply(mat4.makeRotationZ(degreesToRadians(anglecarro)));

    // Movendo as rodas
    if (anglecarro <= 10 || anglecarro >= -10){ // Limitando o giro das rodas
      c1.matrix.multiply(mat4.makeRotationZ(degreesToRadians(anglecarro)));
      c4.matrix.multiply(mat4.makeRotationZ(degreesToRadians(anglecarro)));
    }
  }

  function atualizap(){
    // px = p1.position.x + math.sin(desloc);
    // py = p1.position.y + math.cos(desloc);
  }

  function aceleracarro(){
    if(keyboard.down("up") && sc < 100){
      sc = sc + 1;
    }
    p1.position.x -= sc*Math.cos(anglecarro)*d;
    p1.position.y -= sc*Math.sin(anglecarro)*d;

    //if(sc < 100){
    //  sc = sc + ac;
    //}
    //desloc = sc + clock*getDelta();
    //atualizap();
  }

  function keyboardUpdate() {

    keyboard.update();

    var angle = degreesToRadians(10);
    var rotAxis = new THREE.Vector3(0,0,1); // Set Z axis

    var meucu = 0;

    if ( keyboard.pressed("left") )     anglecarro -= 0.1;
    if ( keyboard.pressed("right") )    anglecarro += 0.1;
    if ( keyboard.pressed("up") )       aceleracarro();
    if ( keyboard.pressed("down") && sc > 0)     sc -= 1;

    //if ( keyboard.pressed("A") )  camera1;
    //if ( keyboard.pressed("D") )  camera2;
    acelera();
  }

  function showInformation()
  {
    // Use this to show information onscreen
    controls = new InfoBox();
    controls.add("Geometric Transformation");
    controls.addParagraph();
    controls.add("Use keyboard arrows to move the cube.");
    controls.add("Press Page Up or Page down to move the cube over the Z axis");
    controls.add("Press 'A' and 'D' to rotate.");
    controls.add(anglecarro);
    controls.show();
  }

  function render()
  {
    stats.update(); // Update FPS
    acelera();
    trackballControls.update();
    keyboardUpdate();
    requestAnimationFrame(render); // Show events
    renderer.render(scene, camera) // Render scene
  }
}