function main() {
  var stats = initStats();          // To show FPS information
  var scene = new THREE.Scene();    // Create main scene
  var renderer = initRenderer();    // View function in util/utils

  var position = new THREE.Vector3(-45, 0, 20);
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.copy(position);
  // camera.lookAt(new THREE.Vector3(0, 0, 0)); // or camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1); // That's the default value

  // Use to scale the cube
  var scale = 1.0;
  var sc = 0; // velocidade do carro
  var anglecarro = 0;
  var ac = 1; // aceleração do carro
  var desloc = 0;
  // var d = Clock.getDelta();
  var d = 0.3;

  var cont = 0

  var isInspecao = false;
  var posicaoCarro = new THREE.Vector3(0, 0, 1);

  // Configurando a luz
  let light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 1, 1).normalize();
  scene.add(light);

  // Show text information onscreen
  showInformation();

  // To use the keyboard
  var keyboard = new KeyboardState();

  // Enable mouse rotation, pan, zoom etc.
  var trackballControls = new THREE.TrackballControls(camera, renderer.domElement);

  // Show axes (parameter is size of each axis)
  var axesHelper = new THREE.AxesHelper(12);
  scene.add(axesHelper);

  // create the ground plane
  var planeGeometry = new THREE.PlaneGeometry(2000, 2000);
  planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
  var planeMaterial = new THREE.MeshBasicMaterial({
    color: 'rgb(150, 150, 150)',
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 1, // positive value pushes polygon further away
    polygonOffsetUnits: 1
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
  var p1 = createCube(8, 3, 1, 0x363636);
  scene.add(p1);
  p1.position.set(2, 0, 1);

  // Traseira
  var p2 = createCube(2, 5, 0.5, 0x006400);
  p1.add(p2);
  p2.position.set(-3, 0, 3.4);
  // esq
  var p3 = createCube(2, 0.6, 3.6, 0x006400);
  p1.add(p3);
  p3.position.set(-3, 1.4, 1.4);
  // dir
  var p4 = createCube(2, 0.6, 3.6, 0x006400);
  p1.add(p4);
  p4.position.set(-3, -1.4, 1.4);

  // Proteção ao Motorista
  //tras
  var p5 = createCube(0.4, 2.8, 1.6, 0x0000CD);
  p1.add(p5);
  p5.position.set(3.8, 0, 1);
  //frente
  var p6 = createCube(0.4, 2.8, 1.6, 0x0000CD);
  p1.add(p6);
  p6.position.set(-1.8, 0, 1);
  //dir
  var p7 = createCube(6, 0.4, 1.6, 0x191970);
  p1.add(p7);
  p7.position.set(1, 1.6, 1);
  //esq
  var p8 = createCube(6, 0.4, 1.6, 0x191970);
  p1.add(p8);
  p8.position.set(1, -1.6, 1);

  // Proteção da frente
  var p9 = createCube(1.4, 5, 1, 0x191970);
  p1.add(p9);
  p9.position.set(-3.4, 0, 0);
  // complemento
  var p10 = createCube(2, 3.6, 1.6, 0x191970);
  p1.add(p10);
  p10.position.set(5, 0, 1);

  // Proteção da frente
  var p11 = createCube(2, 5, 1, 0x191970);
  p1.add(p11);
  p11.position.set(5, 0, 0);

  //bancos
  //assento
  var p12 = createCube(2, 2, 1, 0x000000);
  p1.add(p12);
  p12.position.set(0, 0, 1);
  // encosto
  var p13 = createCube(0.4, 2, 3, 0x000000);
  p1.add(p13);
  p13.position.set(-1, 0, 2);

  // vermelho, verde e azul (x,y,z)

  // Criação das rodas do carro
  // Criação do Eixo da tras
  var c1 = createCylinder(0.3, 6, 0x708090);
  p1.add(c1);
  c1.position.set(-2, 0, 0);

  var c2 = createCylinder(1, 1, 0x1C1C1C);
  c2.position.set(0, 3.0, 0);
  c1.add(c2);

  var c3 = createCylinder(1, 1, 0x1C1C1C);
  c1.add(c3);
  c3.position.set(0, -3.0, 0);

  // Criação do Eixo dianteiro
  var c4 = createCylinder(0.3, 6, 0x708090);
  p1.add(c4);
  c4.position.set(4, 0, 0);

  var c5 = createCylinder(1, 1, 0x1C1C1C);
  c5.position.set(0, 3.0, 0);
  c4.add(c5);

  var c6 = createCylinder(1, 1, 0x1C1C1C);
  c6.position.set(0, -6, 0);
  c5.add(c6);

  var cubeAxesHelper = new THREE.AxesHelper(9);
  cube.add(cubeAxesHelper);

  // Listen window size changes
  window.addEventListener('resize', function () {
    onWindowResize(camera, renderer)
  }, false);

  render();

  function createCylinder(d, l, colorc) {
    // diamentro,diametro,largura
    const geometry = new THREE.CylinderGeometry(d, d, l, 32);
    const material = new THREE.MeshPhongMaterial({ambient: 0x050505, color: colorc, specular: 0x555555, shininess: 30});
    const cylinder = new THREE.Mesh(geometry, material);
    return cylinder;
  }

  function createCube(x, y, z, colorobj) {
    // largura, profundidade e altura
    const geometry = new THREE.BoxGeometry(x, y, z);
    const material = new THREE.MeshPhongMaterial(
      {ambient: 0x050505, color: colorobj, specular: 0x555555, shininess: 30});
    const cube = new THREE.Mesh(geometry, material);
    return cube;
  }

  function keyboardUpdate() {

    var angle = degreesToRadians(5);
    var rotAxis = new THREE.Vector3(0, 0, 1); // Set Z axis

    keyboard.update();

    if (keyboard.down('space')) changeProjection();

    if (isInspecao) {
      if (keyboard.pressed('D')) p1.rotateZ(-angle);
      if (keyboard.pressed('A')) p1.rotateZ(angle);
    }

    if (keyboard.pressed('right')) {
      if (cont > -10) {
        cont--
        c4.rotateZ(-angle / 4);
      }
    }

    if (keyboard.pressed('left')) {
      if (cont < 10) {
        cont++
        c4.rotateZ(angle / 4);
      }
    }

    if (isInspecao) return;

    if (keyboard.pressed('right')) p1.rotateZ(-angle);
    if (keyboard.pressed('left')) p1.rotateZ(angle);

    if (keyboard.pressed('up')) p1.translateX(1);
    if (keyboard.pressed('down')) p1.translateX(-1);
  }

  function showInformation() {
    // Use this to show information onscreen
    controls = new InfoBox();
    controls.add('Geometric Transformation');
    controls.addParagraph();
    controls.add('Use keyboard arrows to move the cube.');
    controls.add('Press Page Up or Page down to move the cube over the Z axis');
    controls.add('Press \'A\' and \'D\' to rotate.');
    controls.add(anglecarro);
    controls.show();
  }

  function changeProjection() {
    // posicao anterior
    let pos = new THREE.Vector3().copy(camera.position);

    isInspecao = !isInspecao;

    axesHelper.visible = false;

    if (isInspecao) {
      posicaoCarro.copy(p1.position);

      p1.position.copy(new THREE.Vector3());

      camera.position.copy(pos);
      camera.lookAt(p1.position);

      plane.visible = false;

    } else {
      p1.position.copy(posicaoCarro)

      let offset = new THREE.Vector3(-45, 0, 20);
      offset.add(p1.position);

      let offSetLookAt = new THREE.Vector3(60, 0, 10);
      offSetLookAt.add(p1.position);

      camera.position.copy(offset);
      camera.lookAt(offSetLookAt);

      plane.visible = true;
    }


    let up = new THREE.Vector3(0, 0, 1);
    camera.up.copy(up);

    trackballControls = initTrackballControls(camera, renderer);
    lightFollowingCamera(light, camera)
  }

  function trackCar() {

    if (isInspecao) return

    var position = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();

    camera.matrixAutoUpdate = true;
    p1.matrixWorld.decompose(position, quaternion, scale);

    camera.up.set(0, 0, 1);
    camera.lookAt(position);

    p1.add(camera);
  }


  function render() {
    stats.update(); // Update FPS
    trackballControls.update();
    keyboardUpdate();
    trackCar();
    lightFollowingCamera(light, camera) // Makes light follow the camera
    requestAnimationFrame(render); // Show events
    renderer.render(scene, camera) // Render scene
  }
}
