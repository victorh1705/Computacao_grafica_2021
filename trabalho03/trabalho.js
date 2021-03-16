function main() {
  var stats = initStats();          // To show FPS information
  var scene = new THREE.Scene();    // Create main scene
  var renderer = initRenderer();    // View function in util/utils

  var position = new THREE.Vector3(-150, 0, 50);
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.copy(position);
  camera.lookAt(new THREE.Vector3(0, 0, 0)); // or camera.lookAt(0, 0, 0);
  camera.up.set(0, 0, 1); // That's the default value


  var cont = 0

  var isInspecao = false;
  var isPilotView = false;
  var posicaoCarro = new THREE.Vector3(0, 0, 1);
  var posicaoCamera = new THREE.Vector3();
  var objs = []

  // === Luz ===

  // Construindo os postes
  function setPointLight(x, y) {
    // Configurando o spot no lugar da PointLight
    const light = new THREE.SpotLight(0xffffff);
    light.position.set(x, y, 26);
    light.intensity = 1;
    light.decay = 1;
    light.penumbra = 0.5;
    light.rotateY(degreesToRadians(90));

    light.angle = 0.1;
    light.distance = 400;

    // Criando a lâmpada
    var lightPosition = new THREE.Vector3(x, y, 24);
    var lightSphere = createLightSphere(scene, 1, 10, 10, lightPosition);

    // Criando o poste
    var poste = createStake(0.8, 1.8, 26, 20, 4, false, x, y);

    objs.push(lightSphere);
    objs.push(poste);

    return {light, poste, lightSphere};
  }

  // Construção da luz direcional
  function setDirectionalLighting(x, y, z) {
    var directionalLight = new THREE.DirectionalLight('rgb(255,255,255)');
    directionalLight.position.set(x, y, z);
    directionalLight.intensity = 1;

    directionalLight.castShadow = true;

    directionalLight.shadow.camera.far = 2000;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;

    return directionalLight
  }

  // SpotLight
  function setSpotLight(x, y, z) {
    var spotLight = new THREE.SpotLight('rgb(255,255,255)');
    spotLight.position.set(x, y, z);
    spotLight.intensity = 1.
    spotLight.decay = 2;
    spotLight.penumbra = 0.5;

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.fov = degreesToRadians(40);

    return spotLight;
  }

  let sun = setDirectionalLighting(-200, -400, 600);
  scene.add(sun);

  let spotlight = setSpotLight(-150, 0, 50);
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
  objs.push(axesHelper)

  // create the ground plane
  var textureLoader = new THREE.TextureLoader();
  var roda = textureLoader.load('./imgs/roda.jpg');
  var lataria = textureLoader.load('./imgs/carro.jpg');
  var banco = textureLoader.load('./imgs/couro.jpg');
  var tpista = textureLoader.load('./imgs/sand.jpg');
  var floor = textureLoader.load('./imgs/pista.jpg');

  var planeGeometry = new THREE.PlaneGeometry(600, 600);
  planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
  var planeMaterial = new THREE.MeshLambertMaterial({color: 'rgb(255,255,255)', side: THREE.DoubleSide});
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);

  plane.receiveShadow = true;
  plane.material.map = floor;

  scene.add(plane);

  // Criando a estensão da pista
  var etpista = new THREE.PlaneGeometry(1200, 1200);
  etpista.translate(0, 0, -0.22);
  var pista = new THREE.Mesh(etpista,
    new THREE.MeshLambertMaterial({
        color: 'rgb(255,255,255)',
        side: THREE.DoubleSide,
      },
    ));
  pista.receiveShadow = true
  scene.add(pista);
  pista.material.map = tpista;
  pista.material.map.repeat.set(4, 4);
  pista.material.map.wrapS = THREE.RepeatWrapping;
  pista.material.map.wrapT = THREE.RepeatWrapping;

  objs.push(plane);
  objs.push(tpista);
  objs.push(floor);
  objs.push(pista);

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

  // objecto com constante de movimento do carro
  var car = {
    speed: 0.,

    acceleration: 0.,
    accelerationRate: 0.05,

    maxAcc: .5,
    maxSpeed: 3,
    maxReverse: 0.35,
    maxSpeedReverse: 1.5,

    friction: 0.05,
    frictionOnTurn: 3 * this.friction,

    direction: FRONT,

    maxRotation: 25,
    angle: 2.5,
    maxAngle: 10.,

    accelerate: function () {
      this.acceleration = (this.acceleration + this.accelerationRate < this.maxAcc)
        ? this.acceleration += this.accelerationRate
        : this.maxAcc;

      this.direction = FRONT

      this.speed = (this.speed + this.acceleration > this.maxSpeed)
        ? this.maxSpeed
        : this.speed + this.acceleration;

      return this.speed
    },

    reverse: function () {
      if (this.acceleration + this.speed <= -this.maxSpeedReverse) {
        this.speed = -this.maxSpeedReverse;
      } else if (this.acceleration <= -this.maxReverse) {
        this.acceleration -= this.accelerationRate;
        this.speed += this.acceleration;
      }
      this.speed -= this.friction;
      this.direction = REVERSE;

      return this.speed;
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
  p1.position.set(-80, -200, 1);

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
  p5.material.map = lataria;

  //frente
  var p6 = createCube(0.4, 2.8, 1.6, 0x0000CD);
  p1.add(p6);
  p6.position.set(-1.8, 0, 1);
  p6.material.map = lataria;

  //dir
  var p7 = createCube(6, 0.4, 1.6, 0x191970);
  p1.add(p7);
  p7.position.set(1, 1.6, 1);
  p7.material.map = lataria;

  //esq
  var p8 = createCube(6, 0.4, 1.6, 0x191970);
  p1.add(p8);
  p8.position.set(1, -1.6, 1);
  p8.material.map = lataria;

  // Proteção da frente
  var p9 = createCube(1.4, 5, 1, 0x191970);
  p1.add(p9);
  p9.position.set(-3.4, 0, 0.1);
  p9.material.map = lataria;

  // complemento
  var p10 = createCube(2, 3.6, 1.6, 0x191970);
  p1.add(p10);
  p10.position.set(5, 0, 1);
  p10.material.map = lataria;

  // Proteção da frente
  var p11 = createCube(2, 5, 1, 0x191970);
  p1.add(p11);
  p11.position.set(5, 0, 0);
  p11.material.map = lataria;

  //bancos
  //assento
  var p12 = createCube(2, 2, 1, 0xa0a0a0);
  p1.add(p12);
  p12.position.set(0, 0, 1);
  p12.material.map = banco;
  // encosto
  var p13 = createCube(0.4, 2, 3, 0xa0a0a0);
  p1.add(p13);
  p13.position.set(-1, 0, 2);
  p13.material.map = banco;

  // vermelho, verde e azul (x,y,z)

  // Criação das rodas do carro
  // Criação do Eixo da tras
  var c1 = createCylinder(0.3, 6, 0x708090);
  p1.add(c1);
  c1.position.set(-2, 0, 0);

  var c2 = createCylinder(1, 1, 0x1C1C1C);
  c2.position.set(0, 3.0, 0);
  c1.add(c2);
  c2.material.map = roda;

  var c3 = createCylinder(1, 1, 0x1C1C1C);
  c1.add(c3);
  c3.position.set(0, -3.0, 0);
  c3.material.map = roda;

  // Criação do Eixo dianteiro
  var c4 = createCylinder(0.3, 6, 0x708090);
  p1.add(c4);
  c4.position.set(3, 0, 0);

  var c5 = createCylinder(1, 1, 0x1C1C1C);
  c5.position.set(0, 3.0, 0);
  c4.add(c5);
  c5.material.map = roda;

  var c6 = createCylinder(1, 1, 0x1C1C1C);
  c6.position.set(0, -6, 0);
  c5.add(c6);
  c6.material.map = roda;

  var cubeAxesHelper = new THREE.AxesHelper(9);
  cube.add(cubeAxesHelper);

  // Listen window size changes
  window.addEventListener('resize', function () {
    onWindowResize(camera, renderer)
  }, false);

  buildInterface();
  render();
  skybox();

  function skybox() {
    let materialArray = [];
    let texture_ft = new THREE.TextureLoader().load('./skybox/arid2_ft.jpg');
    let texture_bk = new THREE.TextureLoader().load('./skybox/arid2_bk.jpg');
    let texture_up = new THREE.TextureLoader().load('./skybox/arid2_up.jpg');
    let texture_dn = new THREE.TextureLoader().load('./skybox/arid2_dn.jpg');
    let texture_rt = new THREE.TextureLoader().load('./skybox/arid2_rt.jpg');
    let texture_lf = new THREE.TextureLoader().load('./skybox/arid2_lf.jpg');

    materialArray.push(new THREE.MeshBasicMaterial({map: texture_ft}));
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_bk}));
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_up}));
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_dn}));
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_rt}));
    materialArray.push(new THREE.MeshBasicMaterial({map: texture_lf}));

    for (let i = 0; i < 6; i++) {
      materialArray[i].side = THREE.BackSide;
    }

    let skyboxGeo = new THREE.BoxGeometry(6000, 6000, 6000);
    let skybox = new THREE.Mesh(skyboxGeo, materialArray);
    scene.add(skybox);
    skybox.rotateX(degreesToRadians(90));
  }

  function createCylinder(d, l, color) {
    // diamentro,diametro,largura
    let cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(d, d, l, 32),
      new THREE.MeshLambertMaterial({color: 'rgb(46,52,57)', side: THREE.DoubleSide}),
    );

    cylinder.castShadow = true;
    cylinder.receiveShadow = true;

    return cylinder;
  }

  // Cilindro usado para a criação do poste
  function createStake(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, x, y) {
    let object = new THREE.Mesh(
      new THREE.CylinderGeometry(
        radiusTop, radiusBottom, height,
        radialSegments, heightSegments, openEnded,
      ),
      new THREE.MeshPhongMaterial({color: 'rgb(124, 187, 250)'}),
    );

    object.castShadow = true;
    object.position.set(x, y, 10);
    object.rotateX(degreesToRadians(90));

    return object;
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
  function criamontanha(x, y, b, h, color = 'rgb(100,70,20)') {

    // Object Material
    var objectMaterial = new THREE.MeshPhongMaterial({
      color: color,
      opacity: 1,
      transparent: true,
    });

    var localPoints = generatePoints(20, b, h);

    convexGeometry = new THREE.ConvexBufferGeometry(localPoints);
    object = new THREE.Mesh(convexGeometry, objectMaterial);
    object.receiveShadow = true;
    object.castShadow = true;
    object.visible = true;
    object.position.x = x;
    object.position.y = y;

    scene.add(object);
    objs.push(object);
  }

  function criarMontanhaMaior(x = 220, y = 60) {
    criamontanha(x, y, 60, 100);
    criamontanha(x - 10, y, 60, 90);
    criamontanha(x + 10, y, 60, 95);
  }

  function criarMontanhaMenor(x = 550, y = 145) {
    criamontanha(x, y, 35, 50);
    criamontanha(x + 5, y + 5, 30, 40);
  }

  // === objeto exportado ===
  function criarEstatua(x, y, z, caminho, escala, girax, giray, giraz) {
    var loader = new THREE.GLTFLoader();
    loader.load(caminho, function (gltf) {
      var obj = gltf.scene;

      gltf.scene.traverse(function (node) {

        if (node.isMesh) {
          node.castShadow = true;
        }

      });

      obj.castShadow = true;
      obj.receiveShadow = true;

      if (girax != 0) {
        obj.rotateX(degreesToRadians(girax));
      }
      if (giraz != 0) {
        obj.rotateZ(degreesToRadians(giraz));
      }
      if (giray != 0) {
        obj.rotateY(degreesToRadians(giray));
      }

      var newScale = escala;
      var scale = getMaxSize(obj); // Available in 'utils.js'

      obj.scale.set(
        newScale * (1.0 / scale),
        newScale * (1.0 / scale),
        newScale * (1.0 / scale),
      );

      obj.position.x = x;
      obj.position.y = y;
      obj.position.z = z;

      scene.add(obj);
      objs.push(obj);
    })
  }

  criarMontanhaMaior(-4, -4);
  criarMontanhaMenor(250, 80);

  criarEstatua(180, -130, -20, './assets/objects/link/scene.gltf', 80, 90, 180, 0);
  criarEstatua(-180, -140, 18, './assets/objects/cogumelo/scene.gltf', 40, 90, -90, 0);
  criarEstatua(-160, 160, 0, './assets/objects/mario/scene.gltf', 80, 90, 0, 0);

  let postes = []

  postes.push(setPointLight(-220, -240))
  postes.push(setPointLight(220, -240))
  postes.push(setPointLight(80, -240))
  postes.push(setPointLight(-80, -240))

  postes.push(setPointLight(-140, 60))

  postes.push(setPointLight(20, 120))

  postes.push(setPointLight(270, 270))

  postes.push(setPointLight(-260, 260))

  postes.forEach(item => {
    scene.add(item.pointLight)
    scene.add(item.poste)
  });

  // === Teclado ===

  function keyboardUpdate() {

    var angle = degreesToRadians(car.angle);

    keyboard.update();

    if (keyboard.down('space')) changeProjection();
    if (keyboard.down('E')) changeCamera();

    if (keyboard.pressed('right')) {
      if (cont > -car.maxRotation) {
        cont--
        c4.rotateZ(-angle / 4);
      }
    } else if (keyboard.pressed('left')) {
      if (cont < car.maxRotation) {
        cont++
        c4.rotateZ(angle / 4);
      }
    } else {
      // volta ao normal sem virar
      if (cont > 0) {
        cont--
        c4.rotateZ(-angle / 4);
      } else if (cont < 0) {
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
      } else if (keyboard.pressed('left')) {
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
    controls.add('Press \'E\' to change the camera.');
    controls.show();
  }

  function changeProjection() {
    // posicao anterior
    isInspecao = !isInspecao;

    let offset;
    let offSetLookAt;

    if (isInspecao) {
      posicaoCarro.copy(p1.position);
      posicaoCamera.copy(camera.position)

      p1.position.copy(new THREE.Vector3());

      offSetLookAt = p1.position;

      offset = new THREE.Vector3(45, 0, 20);
      offset.add(p1.position);
    } else {
      p1.position.copy(posicaoCarro);

      offSetLookAt = new THREE.Vector3(60, 0, 10);
      offSetLookAt.add(p1.position);

      offset = new THREE.Vector3();
      offset.copy(posicaoCamera)

      isPilotView = false;
    }
    camera.position.copy(offset);
    camera.lookAt(offSetLookAt);

    objs.forEach(item => item.visible = !isInspecao);


    let up = new THREE.Vector3(0, 0, 1);
    camera.up.copy(up);

    trackballControls = initTrackballControls(camera, renderer);
  }

  function changeCamera() {
    // posicao anterior
    isPilotView = !isPilotView;

    let offset;
    let offSetLookAt;

    if (isPilotView) {
      posicaoCamera.copy(camera.position)

      p1.position.copy(new THREE.Vector3());

      offset = new THREE.Vector3(-25, 0, 10);
      offset.add(p1.position);

      offSetLookAt = new THREE.Vector3(60, 60, 0);
      offSetLookAt.add(p1.position)
    } else {
      p1.position.copy(posicaoCarro);

      offset.copy(new THREE.Vector3(posicaoCamera))

      offSetLookAt = new THREE.Vector3(60, 0, 10);
      offSetLookAt.add(p1.position);
    }
    camera.position.copy(offset);
    camera.target = new THREE.Vector3(offSetLookAt)

    objs.forEach(item => item.visible = !isInspecao);


    camera.up.copy(new THREE.Vector3(0, 0, 1));

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

    spotlight.position.copy(camera.position);
  }


  // Construindo o menu
  function buildInterface() {
    //------------------------------------------------------------
    // Interface
    var controls = new function () {
      this.isSpotLightEnable = true;
      this.isDirectionalLightEnable = true;
      this.isPointLightEnable = true;

      this.onEnableSpotLight = function () {
        spotlight.visible = this.isSpotLightEnable;
      };

      this.onEnableDirectionalLight = function () {
        sun.visible = this.isDirectionalLightEnable;
      };

      this.onEnablePointLight = function () {
        postes.forEach(item => item.pointLight.visible = this.isPointLightEnable);
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

    gui.add(controls, 'isPointLightEnable', true)
      .name('Luz dos postes (Point Light)')
      .onChange(function (e) {
        controls.onEnablePointLight()
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
