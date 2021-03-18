function main()
{
  var stats = initStats();          // To show FPS information
  var scene = new THREE.Scene();    // Create main scene
  var renderer = initRenderer();    // View function in util/utils
  var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position

  // Enable mouse rotation, pan, zoom etc.
  var trackballControls = new THREE.TrackballControls( camera, renderer.domElement );

  // Show axes (parameter is size of each axis)
  var axesHelper = new THREE.AxesHelper( 12 );
  scene.add( axesHelper );

  // create the ground plane
  var planeGeometry = new THREE.PlaneGeometry(60, 60);
  planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
  var planeMaterial = new THREE.MeshBasicMaterial({
      color: "rgba(150, 150, 150)",
      side: THREE.DoubleSide,
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // add the plane to the scene
  scene.add(plane);

  // create a cube
  var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
  var cubeMaterial = new THREE.MeshPhongMaterial({color:"rgb(255,255,255)", shininess:"300"});
  var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  // position the cube
  cube.position.set(0.0, 0.0, 2.0);
  // add the cube to the scene
  //scene.add(cube);

  // Postes
  // Criar OITO postes
  var luzp = new Array();
  luzp.push(setPointLight(10,10));
  luzp.push(setPointLight(-10,-10));
  scene.add(luzp[0]);
  scene.add(luzp[1]);

  // Criando Luz direcional
  // Escolha UMA das três
  luzd = setDirectionalLighting(-100,100,100);
  scene.add(luzd);

  luzd = setDirectionalLighting(100,-100,100);
  scene.add(luzd);

  luzd = setDirectionalLighting(100,100,100);
  scene.add(luzd);

  //Criando spot de luz
  // Eles vai SEGUIR o carro
  luzspot = setSpotLight(3,3,3);
  scene.add(luzspot);
  
  //Montanha Maior
  criamontanha(4,4,10,30);
  criamontanha(4,-2,10,30);
  criamontanha(-2,-4,10,30);

  // Montanha Menor
  criamontanha(-40,4,10,20);
  criamontanha(-40,-4,10,20);

  // Colocando a estátua na posição (30,0)
  colocaestatua(30,0);

  buildInterface();
  render();

  // Função para carregar a estátua
  // É preciso rodar o HTML com o Live Server (Plugin do VSC) para o objeto aparecer
  function colocaestatua(x,y){
    var loader = new THREE.GLTFLoader();
    loader.load('../assets/objects/mario/scene.gltf',function(gltf){
      var obj = gltf.scene;
      obj.castShadow = true;
      obj.rotateX(degreesToRadians(90));
      var newScale = 20;
      var scale = getMaxSize(obj); // Available in 'utils.js'
    obj.scale.set(newScale * (1.0/scale),
                  newScale * (1.0/scale),
                  newScale * (1.0/scale));
    obj.position.x = x;
    obj.position.y = y;
    scene.add(obj)
  })
  }

  // Gerando pontos para a construção da montanha
  function generatePoints(numberOfPoints,b,h)
  {
    var points = [];
    var maxSize = 10;
    // Pontos da Base
    for (var i = 0; i < numberOfPoints/2; i++) {
      var randomX = b*Math.sin(Math.floor(Math.random() * 360));
      var randomY = b*Math.cos(Math.floor(Math.random() * 360));
      
      var randomZ = 0;
      points.push(new THREE.Vector3(randomX, randomY, randomZ));
    }

    // Pontos do Corpo
    for (var i = 0; i < numberOfPoints/2; i++) {
      var randomX = 0.6*b*Math.sin(Math.floor(Math.random() * 360));
      var randomY = 0.6*b*Math.cos(Math.floor(Math.random() * 360));

      var randomZ = h*Math.sin(Math.floor(Math.random() * 180));
      // Inverte números negativos
      if(randomZ<0){
        randomZ=randomZ*(-1);
      }
      points.push(new THREE.Vector3(randomX, randomY, randomZ));
    }
    return points;
  }

  // Construindo a montanha
  function criamontanha(posx,posy,b,h){

    var objColor = "rgb(100, 70, 20)";
    var objOpacity = 1;

    // Object Material
    var objectMaterial = new THREE.MeshPhongMaterial({
      color: objColor,
      opacity: objOpacity,
      transparent: true});

    var localPoints = generatePoints(20,b,h);

    convexGeometry = new THREE.ConvexBufferGeometry(localPoints);
    object = new THREE.Mesh(convexGeometry, objectMaterial);
       object.castShadow = true;
       object.visible = true;
       object.position.x=posx;
       object.position.y=posy;
    scene.add(object);
  }

  // Construindo o menu
  function buildInterface()
  {
    //------------------------------------------------------------
    // Interface
    var controls = new function ()
    {
      this.luzd = true;
      this.luzp = true;
      this.luzspot = true;
      

      this.onEnableDirLight = function(){
        luzd.visible = this.luzd;
      };

      this.onEnableSpot = function(){
        luzspot.visible = this.luzspot;
      };

      this.onEnablePontual = function(){
        for(let i=0;i<2;i++){
          luzp[i].visible = this.luzp;
        }
      };

    
    };

    var gui = new dat.GUI();
    gui.add(controls, 'luzd', true)
      .name("Directional Light")
      .onChange(function(e) { controls.onEnableDirLight() });

    gui.add(controls, 'luzp', true)
      .name("Pontual Light")
      .onChange(function(e) { controls.onEnablePontual() });

    gui.add(controls, 'luzspot', true)
      .name("Spot de Luz")
      .onChange(function(e) { controls.onEnableSpot() });
  }


  // Construindo os postes
   function setPointLight(x,y)
  {
    const pointLight = new THREE.PointLight( 0xffffff, 1, 100 );
    pointLight.position.set(x,y,10);
    pointLight.castShadow = true;
    var lightPosition = new THREE.Vector3(x,y,10.3);
    // Criando o poste
    var lightSphere = createLightSphere(scene,0.4,10,10,lightPosition);
    scene.add(createCylinder(0.4, 1.4, 10, 20, 4, false,x,y));
    return pointLight;
  }

  // Construção da luz direcional
  function setDirectionalLighting(x,y,z)
  {
    var dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(x,y,z);
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.castShadow = true;
    dirLight.name = "Direction Light";
    dirLight.shadow.camera.left = -1000;
    dirLight.shadow.camera.right = 1000;
    dirLight.shadow.camera.top = 1000;
    dirLight.shadow.camera.bottom = -1000;
    return dirLight
  }


  // Spot
  function setSpotLight(x,y,z)
  {
    var spotLight = new THREE.SpotLight(0x41F610);
    spotLight.position.set(x,y,z);
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.fov = degreesToRadians(20);
    spotLight.castShadow = true;
    spotLight.decay = 2;
    spotLight.penumbra = 0.05;
    return spotLight;
  }

  // Cilindro usado para a criação do poste
  function createCylinder(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded,x,y)
  {
    var objectMaterial = new THREE.MeshPhongMaterial({color:"rgb(124, 187, 250)"});
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded);
    var object = new THREE.Mesh(geometry, objectMaterial);
      object.castShadow = true;
      object.position.set(x, y, 5);
      object.rotateX(degreesToRadians(90));
    return object;
  }

  // Listen window size changes
  window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );


  function render()
  {
    stats.update(); // Update FPS
    trackballControls.update(); // Enable mouse movements
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
  }
}
