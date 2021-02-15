function main() {
  var stats = initStats();          // To show FPS information
  var scene = new THREE.Scene();    // Create main scene
  var renderer = initRenderer();    // View function in util/utils

  var position = new THREE.Vector3(-45, 0, 20);
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.copy(position);
  // camera.lookAt(new THREE.Vector3(0, 0, 0)); // or camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1); // That's the default value


  var cont = 0

  var isInspecao = false;
  var posicaoCarro = new THREE.Vector3(0, 0, 1);

  // === Luz ===

  // Construção da luz direcional
  function setDirectionalLighting(x, y, z) {
    var directionalLight = new THREE.DirectionalLight(0x409cff);
    directionalLight.position.set(x, y, z);
    directionalLight.intensity = 2;

    directionalLight.castShadow = true;

    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;

    return directionalLight
  }

  // SpotLight
  function setSpotLight(x, y, z) {
    var spotLight = new THREE.SpotLight(0xfffff);
    spotLight.position.set(x, y, z);
    spotLight.intensity = 2.
    spotLight.decay = 2;
    spotLight.penumbra = 0.5;

    // spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.fov = degreesToRadians(40);

    return spotLight;
  }


  sun = setDirectionalLighting(-100, -200, 400);
  scene.add(sun);
  // scene.add(new THREE.CameraHelper(sun.shadow.camera))
  // scene.add(new THREE.DirectionalLightHelper(sun))

  spotlight = setSpotLight(-40, -0, 40);
  camera.add(spotlight);


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
  var planeGeometry = new THREE.PlaneGeometry(8000, 8000);
  planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
  var planeMaterial = new THREE.MeshBasicMaterial({
    color: 'rgb(150, 150, 150)',
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 1, // positive value pushes polygon further away
    polygonOffsetUnits: 1,
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;

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
  var {FRONT, REVERSE} = {
    FRONT: 'front',
    REVERSE: 'reverse',
  }


  var car = {
    speed: 0.,

    acceleration: 0.,
    accelerationRate: 0.05,

    maxAcc: .5,
    maxReverse: 0.35,
    friction: 0.05,
    frictionOnTurn: 3 * this.friction,

    direction: FRONT,

    angle: 2.5,
    maxAngle: 10,

    accelerate: function () {
      if (this.acceleration < this.maxAcc) {
        this.acceleration += this.accelerationRate
        this.speed = this.speed + this.acceleration - this.friction
      }
      this.direction = FRONT

      return this.speed
    },

    reverse: function () {
      if (this.acceleration > -this.maxReverse) {
        this.acceleration -= this.accelerationRate
        this.speed = this.speed + this.acceleration - (-1 * this.friction)
      }
      this.direction = REVERSE

      return this.speed
    },

    getSpeed: function (turning = false) {
      if (this.acceleration > 0) {
        this.acceleration = this.accelerationRate
      }
      if (this.acceleration < 0) {
        this.acceleration += this.accelerationRate
      }

      let friction = turning ? this.frictionOnTurn : this.friction;

      if (this.speed !== 0) {
        if (this.direction === FRONT) {
          this.speed = this.speed < this.friction
            ? 0
            : this.speed - friction;
        } else {
          this.speed = this.speed > this.friction
            ? 0
            : this.speed + friction;
        }
      }

      return this.speed;
    },

  }


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
  var p12 = createCube(2, 2, 1, 0xa0a0a0);
  p1.add(p12);
  p12.position.set(0, 0, 1);
  // encosto
  var p13 = createCube(0.4, 2, 3, 0xa0a0a0);
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

  buildInterface();
  render();


  function createCylinder(d, l, color) {
    // diamentro,diametro,largura
    let cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(d, d, l, 32),
      new THREE.MeshPhongMaterial({
        ambient: 0x050505,
        color: color,
        specular: 0x555555,
        shininess: 30,
      }),
    );

    cylinder.castShadow = true;
    cylinder.receiveShadow = true;

    return cylinder;
  }

  function createCube(x, y, z, color) {
    // largura, profundidade e altura
    let cube = new THREE.Mesh(
      new THREE.BoxGeometry(x, y, z),
      new THREE.MeshPhongMaterial({
        ambient: 0x050505,
        color: color,
        specular: 0x555555,
        shininess: 30,
      }),
    );

    cube.castShadow = true;
    cube.receiveShadow = true;

    return cube;
  }

  // === Montanha ===

  // Gerando pontos para a construção da montanha
  function generatePoints(numberOfPoints, b, h) {
    var points = [];
    var maxSize = 10;
    // Pontos da Base
    for (var i = 0; i < numberOfPoints / 2; i++) {
      var randomX = b * Math.sin(Math.floor(Math.random() * 360));
      var randomY = b * Math.cos(Math.floor(Math.random() * 360));

      var randomZ = 0;
      points.push(new THREE.Vector3(randomX, randomY, randomZ));
    }

    // Pontos do Corpo
    for (var i = 0; i < numberOfPoints / 2; i++) {
      var randomX = 0.6 * b * Math.sin(Math.floor(Math.random() * 360));
      var randomY = 0.6 * b * Math.cos(Math.floor(Math.random() * 360));

      var randomZ = h * Math.sin(Math.floor(Math.random() * 180));
      // Inverte números negativos
      if (randomZ < 0) {
        randomZ = randomZ * (-1);
      }
      points.push(new THREE.Vector3(randomX, randomY, randomZ));
    }
    return points;
  }

  // Construindo a montanha
  function criamontanha(x, y, b, h) {

    var objColor = 'rgb(100, 70, 20)';
    var objOpacity = 1;

    // Object Material
    var objectMaterial = new THREE.MeshPhongMaterial({
      color: objColor,
      opacity: objOpacity,
      transparent: true,
    });

    var localPoints = generatePoints(20, b, h);

    convexGeometry = new THREE.ConvexBufferGeometry(localPoints);
    object = new THREE.Mesh(convexGeometry, objectMaterial);
    object.castShadow = true;
    object.visible = true;
    object.position.x = x;
    object.position.y = y;
    scene.add(object);
  }

  function criarMontanhaMaior(x = 220, y = 60) {
    criamontanha(x, y + 5, 25, 70);
    criamontanha(x - 10, y - 5, 15, 40);
    criamontanha(x + 10, y, 30, 45);
  }

  function criarMontanhaMenor(x = 550, y = 145) {
    criamontanha(x, y, 15, 30);
    criamontanha(x + 5, y + 5, 10, 20);
  }

  criarMontanhaMaior(220, 120);
  criarMontanhaMenor(850, 145);


  function keyboardUpdate() {

    var angle = degreesToRadians(car.angle);

    keyboard.update();

    if (keyboard.down('space')) changeProjection();

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

    if (isInspecao) {
      if (keyboard.pressed('D')) p1.rotateZ(-angle);
      if (keyboard.pressed('A')) p1.rotateZ(angle);

      return
    }

    if (car.speed !== 0) {
      if (keyboard.pressed('right')) {
        car.direction === FRONT
          ? p1.rotateZ(-angle)
          : p1.rotateZ(angle);
      }
      if (keyboard.pressed('left')) {
        car.direction === FRONT
          ? p1.rotateZ(angle)
          : p1.rotateZ(-angle);
      }
    }

    if (keyboard.pressed('up')) {
      p1.translateX(car.accelerate());
    } else if (keyboard.pressed('down')) {
      p1.translateX(car.reverse());
    } else {
      p1.translateX(car.getSpeed())
    }
  }

  function showInformation() {
    // Use this to show information onscreen
    controls = new InfoBox();
    controls.add('Geometric Transformation');
    controls.addParagraph();
    controls.add('Use keyboard arrows to move the cube.');
    controls.add('Press Page Up or Page down to move the cube over the Z axis');
    controls.add('Press \'A\' and \'D\' to rotate.');
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
      axesHelper.visible = true;
    }


    let up = new THREE.Vector3(0, 0, 1);
    camera.up.copy(up);

    trackballControls = initTrackballControls(camera, renderer);
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
    lightFollowingCamera(spotlight, camera)
  }


  // Construindo o menu
  function buildInterface() {
    //------------------------------------------------------------
    // Interface
    var controls = new function () {
      this.isSpotLightEnable = true;
      this.isDirectionalLightEnable = true;

      this.onEnableSpotLight = function () {
        spotlight.visible = this.isSpotLightEnable;
      };

      this.onEnableDirectionalLight = function () {
        sun.visible = this.isDirectionalLightEnable;
      };


    };

    var gui = new dat.GUI();

    gui.add(controls, 'isDirectionalLightEnable', true)
      .name('Luz do Sol (Directional)')
      .onChange(function (e) {
        controls.onEnableDirectionalLight()
      });

    gui.add(controls, 'isSpotLightEnable', true)
      .name('Spot de Luz')
      .onChange(function (e) {
        controls.onEnableSpotLight()
      });
  }


  function render() {
    stats.update(); // Update FPS
    trackballControls.update();
    keyboardUpdate();
    trackCar();
    requestAnimationFrame(render); // Show events
    renderer.render(scene, camera) // Render scene
  }
}
