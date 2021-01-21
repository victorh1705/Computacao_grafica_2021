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
  
  // Configurando luz
  var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 1, 1 ).normalize();
  scene.add(light);
  
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


  // Eixo central do carro
  var p1 = createCube(8,3,1,0x363636);
  scene.add(p1);
  p1.position.set(2,0,1);

  // Traseira
  var p2 = createCube(2,5,0.5,0x006400);
  p1.add(p2);
  p2.position.set(-3,0,3.4);
  // esq
  var p3 = createCube(2,0.6,3.6,0x006400);
  p1.add(p3);
  p3.position.set(-3,1.4,1.4);
  // dir
  var p4 = createCube(2,0.6,3.6,0x006400);
  p1.add(p4);
  p4.position.set(-3,-1.4,1.4);

  // Proteção ao Motorista
  //tras
  var p5 = createCube(0.4,2.8,1.6,0x0000CD);
  p1.add(p5);
  p5.position.set(3.8,0,1);
  //frente
  var p6 = createCube(0.4,2.8,1.6,0x0000CD);
  p1.add(p6);
  p6.position.set(-1.8,0,1);
  //dir
  var p7 = createCube(6,0.4,1.6,0x191970);
  p1.add(p7);
  p7.position.set(1,1.6,1);
  //esq
  var p8 = createCube(6,0.4,1.6,0x191970);
  p1.add(p8);
  p8.position.set(1,-1.6,1);

  // Proteção da frente
  var p9 = createCube(1.4,5,1,0x191970);
  p1.add(p9);
  p9.position.set(-3.4,0,0);
  // complemento
  var p10 = createCube(2,3.6,1.6,0x191970);
  p1.add(p10);
  p10.position.set(5,0,1);

  // Proteção da frente
  var p11 = createCube(2,5,1,0x191970);
  p1.add(p11);
  p11.position.set(5,0,0);

  //bancos
  //assento
  var p12 = createCube(2,2,1,0x000000);
  p1.add(p12);
  p12.position.set(0,0,1);
  // encosto
  var p13 = createCube(0.4,2,3,0x000000);
  p1.add(p13);
  p13.position.set(-1,0,2);

  // vermelho, verde e azul (x,y,z)

  // Criação das rodas do carro
  // Criação do Eixo da frente
  var c1 = createCylinder(0.3,6,0x708090);
  p1.add(c1);
  c1.position.set(-2, 0, 0);

  var c2 = createCylinder(1,1,0x1C1C1C);
  c2.position.set(0, 3.0, 0);
  c1.add(c2);

  var c3 = createCylinder(1,1,0x1C1C1C);
  c1.add(c3);
  c3.position.set(0, -3.0, 0);

  // Criação do Eixo traseiro
  var c4 = createCylinder(0.3,6,0x708090);
  p1.add(c4);
  c4.position.set(4, 0, 0);

  var c5 = createCylinder(1,1,0x1C1C1C);
  c5.position.set(0, 3.0, 0);
  c4.add(c5);

  var c6 = createCylinder(1,1,0x1C1C1C);
  c6.position.set(0, -6, 0);
  c5.add(c6);

  var cubeAxesHelper = new THREE.AxesHelper(9);
  cube.add(cubeAxesHelper);

  // Listen window size changes
  window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

  render();
  
  function createCylinder(d,l,colorc)
  {  
    // diamentro,diametro,largura
    const geometry = new THREE.CylinderGeometry( d, d, l, 32 );
    const material = new THREE.MeshPhongMaterial( { ambient: 0x050505, color: colorc, specular: 0x555555, shininess: 30 } );
    const cylinder = new THREE.Mesh( geometry, material );
    return cylinder;
  }

  function createCube(x, y, z,colorobj)
  {
    // largura, profundidade e altura
    const geometry = new THREE.BoxGeometry(x,y,z);
    const material = new THREE.MeshPhongMaterial( { ambient: 0x050505, color: colorobj, specular: 0x555555, shininess: 30 } );
    const cube = new THREE.Mesh( geometry, material );
    return cube;
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

    if ( keyboard.pressed("right") )     anglecarro -= 0.5;
    if ( keyboard.pressed("left") )    anglecarro += 0.5;
    if ( keyboard.pressed("up") )       sc += 1;
    if ( keyboard.pressed("down"))     sc -= 1;

    if ( keyboard.pressed("D") )  p1.rotateOnAxis(rotAxis,  angle );
    if ( keyboard.pressed("A") )  p1.rotateOnAxis(rotAxis, -angle );

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
