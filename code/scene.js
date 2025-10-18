
// Clases de la biblioteca

import * as THREE from '../libs/three.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'

// Clases del proyecto

import { Apple } from './models/apple.js'
import { Grape } from './models/grape.js'
import { Naranja } from './models/Naranja.js'
import { Pera } from './models/Pera.js'
import { Bomb } from './models/Bomb.js'
import { Snake } from './snake.js'
import { Directions } from './constants/directions.js'
import { BoardValues } from './constants/board-values.js'

import { loadTranslations } from './i18n.js';

/*
Apartados del fichero:
- Mensajes
- Música
- Funciones de la escena
- Teclado
- Raton
- Comida
*/

//El tablero no es perfecto, cada casilla mide 1.0125. Por eso, necesitamos convertir un valor de la matriz a la posicion real con este factor
const factor_conversion_mapa = 1.0125;

//Tamaño que ocupa el borde del tablero en X e Y
const tamanio_borde = 0.45;

 class MyScene extends THREE.Scene {
  // Recibe el  div  que se ha creado en el  html  que va a ser el lienzo en el que mostrar
  // la visualización de la escena
  constructor (myCanvas, translations) { 
    super();

    this.translations = translations;

    // Incluye los bordes del tablero
    this.tamTableroX = 17;
    this.tamTableroY = 17;
    
    // No incluye los bordes del tablero, se usan para la matriz
    this.numeroCasillasX = 16;
    this.numeroCasillasY = 16;

    this.pausa = false;         // Controla pausa
    this.muted = true;          // Controla música silenciada
    this.cambio_camara = false; // Controla cambio de la cámara

    this.renderer = this.createRenderer(myCanvas);
    this.gui = this.createGUI ();
    
    this.createLights ();
    this.createCamera ();
    this.createAudio ();
    this.createAudioGameOver();
    this.createGround ();
    
    this.inicioJuego = false;
    this.reproducido = false; // Controla si se ha reproducido el sonido de gameover

    this.clearMessage();
    this.setMessage(this.translations["start"]);
    this.setMessage(this.translations["credits"]);
  }

  //////////////////////////////////////////////////
  // MENSAJES
  //////////////////////////////////////////////////

  // Enseñar un mensaje por pantalla
  setMessage (str) {
    document.getElementById ("Messages").innerHTML += "<h2>"+str+"</h2>";
  }

  // Limpia apartado mensajes
  clearMessage(){
    document.getElementById ("Messages").innerHTML = "";
  }

  // Escribe mensajes en el apartado de las teclas
  setTeclas (str) {
    document.getElementById ("Teclas").innerHTML += "<h2>"+str+"</h2>";
  }

  // Escribe mensaje de pausa
  setPausa (str) {
    document.getElementById ("Pausa").innerHTML += "<h2>"+str+"</h2>";
  }
  
  // Limpia apartado de las teclas
  clearTeclas(){
    document.getElementById ("Teclas").innerHTML = "";
  }

  // Elimina mensaje de pausa
  clearPausa(){
    document.getElementById ("Pausa").innerHTML = "";
  }

  //Limpia apartado de GameOver
  clearGameOver(){
    document.getElementById ("gameover").innerHTML = "";
  }

  //////////////////////////////////////////////////
  // FIN MENSAJES
  //////////////////////////////////////////////////

  //////////////////////////////////////////////////
  // MÚSICA
  //////////////////////////////////////////////////

  // Crea música de fondo del juego
  createAudio(){
    const listener = new THREE.AudioListener();
    this.camera.add(listener);

    var that = this;
    this.sound = new THREE.Audio(listener);

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('./code/music/snake-song.mp3',
    function (buffer){
      that.sound.setBuffer(buffer);
      that.sound.setLoop(true);
      that.sound.setVolume(0.1);
    });
  }

  // Crea sonido del gameover
  createAudioGameOver(){
    const listener = new THREE.AudioListener();

    var that = this;
    this.gameover = new THREE.Audio(listener);

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('./code/music/gameover-sound.mp3',
    function (buffer){
      that.gameover.setBuffer(buffer);
      that.gameover.setLoop(false);
      that.gameover.setVolume(0.1);
    });
  }

  // Reproduce sonido de gameover
  playGameOver(){
      this.gameover.play();
      this.reproducido = true;
  }

  // Función para el mute. Permite activar y desactivar los sonidos (gameover y musica)
  cambiarMusica(){
    if (this.sound.isPlaying)
    {
      this.muted = true;
      this.sound.pause();
    }
    else
    {
      this.muted = false;
      this.sound.play();
    }
  }

  // Permite reiniciar la musica cuando se reinicia el juego.
  reiniciarMusica(){
    if (this.sound.isPlaying)
      this.sound.stop();
    this.sound.play();
  }

  //////////////////////////////////////////////////
  // FIN MÚSICA
  //////////////////////////////////////////////////

  //////////////////////////////////////////////////
  // FUNCIONES DE LA ESCENA
  //////////////////////////////////////////////////
  
  createCamera () {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    this.camera.position.set (this.tamTableroX/2, this.tamTableroY/2, 22.5); //Colocarlo en el eje y para ver el mapa desde arriba

    var look = new THREE.Vector3 (8,8,0);

    // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
    this.cameraControl = new TrackballControls (this.camera, this.renderer.domElement);
    
    /*
    // Se configuran las velocidades de los movimientos
    this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = -2;
    this.cameraControl.panSpeed = 0.5;
    // Debe orbitar con respecto al punto de mira de la cámara
    this.cameraControl.target = look;
    */

    this.camera.lookAt(look);
    this.add (this.camera);
  }

  // Cámara que sigue a la serpiente
  createCamera2 () {
    this.camera2 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    this.camera2.lookAt(this.snake.segmentosSnake[0].position.x+10, this.snake.segmentosSnake[0].position.y+55, -150);

    this.add (this.camera2);
  }

  // Crea el tablero, sobre el que se ubicará todo
  createGround () {
    
    var geometryGround = new THREE.BoxGeometry (this.tamTableroX,this.tamTableroY, 0.2); 
    
    var texture = new THREE.TextureLoader().load('./code/images/grass.jpg');
    var materialGround = new THREE.MeshPhongMaterial ({map: texture});
    
    this.ground = new THREE.Mesh (geometryGround, materialGround);
    
    this.ground.position.z = -0.1;

    this.ground.position.x += this.tamTableroX/2; //Ponerlo encima de eje X
    this.ground.position.y += this.tamTableroY/2; //Ponerlo a la derecha del eje Y

    this.add (this.ground);
  }
  
  createGUI () {
    // Se crea la interfaz gráfica de usuario
    var gui = new GUI();
    
    this.guiControls = {
      // En el contexto de una función   this   alude a la función
      lightIntensity : 0.4,
    }

    var folder = gui.addFolder ('Luz ambiental');
  
    // Se le añade un control para la intensidad de la luz
    folder.add (this.guiControls, 'lightIntensity', 0, 1, 0.1)
      .name('Intensidad de la Luz : ')
      .onChange ( (value) => this.setLightIntensity (value) );
    
    return gui;
  }
  
  createLights () {

    var ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
    this.add (ambientLight);

    this.spotLight = new THREE.SpotLight( 0xffffff, this.guiControls.lightIntensity );
    this.spotLight.position.set( 0, 0, 60 ); //Desde la camara a abajo
    this.add (this.spotLight);
  }
  
  setLightIntensity (valor) {
    this.spotLight.intensity = valor;
  }
  
  createRenderer (myCanvas) {
    // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.
    
    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer();
    
    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
    
    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);
    
    return renderer;  
  }
  
  getCamera () {
    return this.camera;
  }
  
  setCameraAspect (ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
    this.camera.aspect = ratio;
    // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();
  }
  
  onWindowResize () {
    // Este método es llamado cada vez que el usuario modifica el tamanio de la ventana de la aplicación
    // Hay que actualizar el ratio de aspecto de la cámara
    this.setCameraAspect (window.innerWidth / window.innerHeight);
    
    // Y también el tamaño del renderizador
    this.renderer.setSize (window.innerWidth, window.innerHeight);
  }

  //////////////////////////////////////////////////
  // FIN FUNCIONES DE LA ESCENA
  //////////////////////////////////////////////////


  //////////////////////////////////////////////////
  // TECLADO
  //////////////////////////////////////////////////

  //Leemos que tecla se ha pulsado, y hacemos la acción asociada a esa tecla (mover snake, reiniciar, activar musica...)
  leerTeclado (evento) {
    var x = evento.which || evento.keyCode; //Ver que tecla se pulsó

    if(this.inicioJuego) //Si se ha iniciado el juego, permitir modificar direccion, activar musica y pausar juego
    {
      if(x == '87'){ //Pulsar la W
        this.snake.cambiarDireccion(Directions.ARRIBA);
      }
      else if(x == '83'){ //Pulsar la S
        this.snake.cambiarDireccion(Directions.ABAJO);
      }
      else if(x == '65'){ //Pulsar la A
        this.snake.cambiarDireccion(Directions.IZQUIERDA);
      }
      else if(x == '68'){ // Pulsar la D
        this.snake.cambiarDireccion(Directions.DERECHA);
      }

      else if (x == '77') // Pulsar la M: activamos/desactivamos la musica
      this.cambiarMusica();

      else if(x == '80'){ // Pulsar la P: pausa/reanudar
        this.pausa = !this.pausa; //Cambiar el modo previo de pausa

        if (this.pausa) //Si se pausa
        {
          if (!this.muted) //Si la musica estaba activada, pausala
            this.sound.pause();
          this.setPausa("PAUSA"); //Pon mensaje de pausa
        }
        else{ //Si se reanuda
          if (!this.muted) //Si la musica estaba activada, reanudala
            this.sound.play();
          this.clearPausa();
        }
      }

      else if(x == '67'){ // Pulsar la C, cambio de cámara
        this.cambio_camara = !this.cambio_camara;
      }
    }
    
    if(x == '82'){ // Pulsar la R. Permite iniciar y reiniciar el juego

      //Si ya habia una partida antes, borrar las cosas que habia (frutas, snake y renderer)
      if (this.inicioJuego){ 
        this.snake.eliminarSerpiente();
        this.remove(this.snake); // Borrar de DOM

        this.eliminarFrutas(); //Eliminar material y geometría de las frutas

        // Limpieza de memoria
        this.renderer.renderLists.dispose();
      }

      if (!this.muted) //Si estaba activada la musica, la reiniciamos
        this.reiniciarMusica();
      
      this.reproducido = false; // controla si se ha reproducido el sonido de gameover

      //Borrar mensajes previos y poner los proximos
      this.clearMessage();
      this.clearGameOver();
      this.clearTeclas();

      this.setMessage(this.translations["game-instructions"]);

      this.setMessage(this.translations["apple"]);
      this.setMessage(this.translations["pear"]);
      this.setMessage(this.translations["grape"]);
      this.setMessage(this.translations["orange"]);
      this.setMessage(this.translations["bomb"]);

      this.setTeclas(this.translations["key-w"]);
      this.setTeclas(this.translations["key-a"]);
      this.setTeclas(this.translations["key-s"]);
      this.setTeclas(this.translations["key-d"]);
      this.setTeclas(this.translations["key-c"]);
      this.setTeclas(this.translations["key-p"]);
      this.setTeclas(this.translations["key-m"]);
      this.setTeclas(this.translations["key-r"]);
      
      this.inicioJuego = true;
      this.snake = new Snake(this.tamTableroX, this.tamTableroY, this.numeroCasillasX, this.numeroCasillasY); //crear snake

      this.createCamera2(); //Crear la camara2 (la que sigue al snake ya que depende de este)

      this.crearFrutas(); //Crear frutas
      
      this.add(this.snake); //Añadir el snake
    }
  }

  //////////////////////////////////////////////////
  // FIN TECLADO
  //////////////////////////////////////////////////

  //////////////////////////////////////////////////
  // RATON
  //////////////////////////////////////////////////

  // Leer una posicion de la ventana
  leerRaton(evento) {
    if (!this.inicioJuego || !this.snake) return;  // Prevent access if game not started

    var objetos = [this.ground]; //Objetos seleccionables - El tablero sobre el que haremos click

    var mouse = new THREE.Vector2 ();

    //Obtener poscicion del clic en coordenadas de dispositivo normalizado
    mouse.x = (evento.clientX / window.innerWidth) * 2 - 1;
    mouse.y = 1 - 2 * (evento.clientY / window.innerHeight);

    //Se construye rayo que pasa por la posicion sobre la que se hizo clic, a partir de la camara inicial (la estática)
    var raycaster = new THREE.Raycaster ();
    raycaster.setFromCamera(mouse, this.camera);

    const pickedObjects = raycaster.intersectObjects(objetos, true); //Ver los objetos sobre los que hizo pick (aunque realmente solo hay un objeto)

    if(pickedObjects.length > 0)
    {
      var punto_seleccionado = new THREE.Vector3(pickedObjects[0].point) //Ver el punto en el que hizo click

      // Nos quedamos con las coordenadas que marcó
      // Coonvertimos las coordenadas a enteros, que representan el indice de la matriz que se ha clickado
      var coordenada_x = Math.trunc((punto_seleccionado.x.x-tamanio_borde)/factor_conversion_mapa);
      var coordenada_y = Math.trunc((punto_seleccionado.x.y-tamanio_borde)/factor_conversion_mapa);

      var distancia_x = coordenada_x - this.snake.getColumnaCabeza(); //Distancia al punto que ha clickado 
      var distancia_y = coordenada_y - this.snake.getFilaCabeza();

      // La serpiente irá a la dirección en la que haya más distancia
      // Destacamos que no se puede cambiar el sentido directamente debido a los condicionales del metodo CambiarDireccion

      if(Math.abs(distancia_x) > Math.abs(distancia_y)) // Si la distancia de X es mayor que Y. Iremos a la izq o dcha
      {
        if(distancia_x > 0) //Si la diferencia es positiva, la posicion marcada esta a la derecha
          this.snake.cambiarDireccion(Directions.DERECHA);
        else
          this.snake.cambiarDireccion(Directions.IZQUIERDA);
      }

      else if (Math.abs(distancia_x) < Math.abs(distancia_y)) // Si la distancia de X es mayor que Y. Iremos arriba o abajo
      {
        if(distancia_y > 0) //Si la diferencia es positiva, la posicion marcada esta arriba
          this.snake.cambiarDireccion(Directions.ARRIBA);
        else
          this.snake.cambiarDireccion(Directions.ABAJO);
      }
      //En caso de empate entre distancias, no hacemos nada
    }
  }

  //////////////////////////////////////////////////
  // FIN RATON
  //////////////////////////////////////////////////

  //////////////////////////////////////////////////
  // COMIDA
  //////////////////////////////////////////////////

  //Obtiene una celda random vacia de la matriz, dado un limite de x y limite de y
  obtenerCeldaRandomVacia(max1, max2){

    do {
      var pos_x = Math.floor(Math.random() * max1);
      var pos_y = Math.floor(Math.random() * max2);
    } while (this.snake.getCeldaMatriz(pos_y, pos_x) != BoardValues.VACIO); // obtener casilla aleatoria que no esté ocupada 

    return {pos_x, pos_y}; // Devolvemos vector con los índices de la celda
  }

  // Si la cabeza del snake esta en una fruta (o bomb), procesa su acción. Además borra la fruta actual, y crea otra en una posicion random
  procesarComida(){
    var fila_cabeza = this.snake.getFilaCabeza();
    var columna_cabeza = this.snake.getColumnaCabeza();

    var casilla = this.snake.getCeldaMatriz(fila_cabeza, columna_cabeza); //Valor de la celda en la que esta ahora mismo el snake
    var celda = this.obtenerCeldaRandomVacia(this.numeroCasillasY, this.numeroCasillasX); //genera una pos random

    //En funcion de la fruta que haya, hacer la función correspondiente, marcar la casilla como ocupada por el snake y volver a crear la fruta
    if (casilla === BoardValues.APPLE){
        this.snake.incrementarTamanio();
        this.snake.setCeldaMatriz(fila_cabeza, columna_cabeza, BoardValues.SERPIENTE); //Las serpiente se comio la fruta
        this.apple.destroyApple();
        this.remove(this.apple);

        this.createApple(celda.pos_y, celda.pos_x);
    }

    else if (casilla === BoardValues.GRAPE){
      this.snake.decrementarTamanio();
      this.snake.setCeldaMatriz(fila_cabeza, columna_cabeza, BoardValues.SERPIENTE);
      this.grape.destroyGrape();
      this.remove(this.grape);

      this.createGrape(celda.pos_y, celda.pos_x);
    }

    else if (casilla === BoardValues.PERA){
      this.snake.aumentarVelocidad();
      this.snake.setCeldaMatriz(fila_cabeza, columna_cabeza, BoardValues.SERPIENTE);
      this.pera.destruirPera();
      this.remove(this.pera);

      this.crearPera(celda.pos_y, celda.pos_x);
    }

    else if (casilla === BoardValues.NARANJA){
      this.snake.reducirVelocidad();
      this.snake.setCeldaMatriz(fila_cabeza, columna_cabeza, BoardValues.SERPIENTE);
      this.naranja.destruirNaranja();
      this.remove(this.naranja);

      this.crearNaranja(celda.pos_y, celda.pos_x);
    }

    else if (casilla === BoardValues.BOMB){
      this.snake.setCeldaMatriz(fila_cabeza, columna_cabeza, BoardValues.SERPIENTE);
      this.snake.perderJuego();
      this.bomb.destroyBomb();
      this.remove(this.bomb);
    }
  }

  // Crea TODAS las frutas en posiciones aleatorias que no estén ocupadas
  crearFrutas(){
    // NOTA IMPORTANTE: Recordamos que la y para nosotros son las filas y la x
    // son las columnas, por eso invertimos los parámetros
    var celda = this.obtenerCeldaRandomVacia(this.numeroCasillasY, this.numeroCasillasX);
    this.createApple(celda.pos_y, celda.pos_x);
    
    celda = this.obtenerCeldaRandomVacia(this.numeroCasillasY, this.numeroCasillasX);
    this.crearPera(celda.pos_y, celda.pos_x);

    celda = this.obtenerCeldaRandomVacia(this.numeroCasillasY, this.numeroCasillasX);
    this.createGrape(celda.pos_y, celda.pos_x);

    celda = this.obtenerCeldaRandomVacia(this.numeroCasillasY, this.numeroCasillasX);
    this.crearNaranja(celda.pos_y, celda.pos_x);

    celda = this.obtenerCeldaRandomVacia(this.numeroCasillasY, this.numeroCasillasX);
    this.createBomb(celda.pos_y, celda.pos_x);
  }
  
  //Elimina TODAS las frutas que hay en la escena. "Borrado en cascada"
  eliminarFrutas(){
      this.apple.destroyApple();
      this.remove(this.apple);

      this.pera.destruirPera();
      this.remove(this.pera);

      this.grape.destroyGrape();
      this.remove(this.grape);

      this.naranja.destruirNaranja();
      this.remove(this.naranja);

      this.bomb.destroyBomb();
      this.remove(this.bomb);
  }

  //Creamos en la posición real, dada una fila y columna de la matriz determinada, la apple. También marcamos en la matriz que hay una apple
  createApple(fila, columna){
    // Reflejar en la matriz que se ha añadido la fruta
    this.snake.setCeldaMatriz(fila, columna, BoardValues.APPLE);

    this.apple = new Apple();

    this.apple.position.set(factor_conversion_mapa*columna, factor_conversion_mapa*fila, 0);

    this.add (this.apple);
  }

  createGrape(fila, columna){
    this.snake.setCeldaMatriz(fila, columna, BoardValues.GRAPE);

    this.grape = new Grape();
    this.grape.position.set(factor_conversion_mapa * columna, factor_conversion_mapa * fila, 0);

    this.add (this.grape);
  }

  //Creamos en la posición real, dada una fila y columna de la matriz determinada, la pera. También marcamos en la matriz que hay una pera
  crearPera(fila, columna){
    this.snake.setCeldaMatriz(fila, columna, BoardValues.PERA);

    this.pera = new Pera();
    this.pera.position.set(factor_conversion_mapa*columna, factor_conversion_mapa*fila, 0);

    this.add(this.pera);
  }

  //Creamos en la posición real, dada una fila y columna de la matriz determinada, la bomb. También marcamos en la matriz que hay una bomb
  createBomb(fila, columna){
    this.snake.setCeldaMatriz(fila, columna, BoardValues.BOMB);

    this.bomb = new Bomb();
    this.bomb.position.set(factor_conversion_mapa*columna, factor_conversion_mapa*fila, 0);

    this.add(this.bomb);
  }

  //Creamos en la posición real, dada una fila y columna de la matriz determinada, la naranja. También marcamos en la matriz que hay una naranja
  crearNaranja(fila, columna){
    this.snake.setCeldaMatriz(fila, columna, BoardValues.NARANJA);

    this.naranja = new Naranja();
    this.naranja.position.set(factor_conversion_mapa*columna, factor_conversion_mapa*fila, 0);

    this.add (this.naranja);
  }


  //////////////////////////////////////////////////
  // FIN COMIDA
  //////////////////////////////////////////////////

  update () {
    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render (this, this.getCamera());
    
    if(this.inicioJuego) //Si ha iniciado, haz el update del snake y de lo demás
    {
      if (!this.pausa) //Si no se ha pausado el juego
      {

        if (this.cambio_camara) //Si hemos cambiado de camara, renderizarla
        {
          this.renderer.render (this, this.camera2);
          var offset = new THREE.Vector3(this.snake.segmentosSnake[0].position.x, this.snake.segmentosSnake[0].position.y-6, this.snake.segmentosSnake[0].position.z+14);
          
          // Cambia la posicion de la cámara. Lerp interpola entre la posición de la cámara y el offset. No es necesario obtener la posiciones mundiales
          this.camera2.position.lerp(offset, 0.05);
        }

        this.snake.update(); //Actualizar la serpiente

        //if Para evitar hacer get en una casilla fuera de índice y haya error por los indices
        if(!this.snake.comprobarChoqueMuro(this.snake.getFilaCabeza(), this.snake.getColumnaCabeza())) 
          this.procesarComida(); //Si hay comida en la casilla, la procesa
        
        if(this.snake.finPartida) //Si es el fin de la partida
        {
          // Parar música del juego
          if (this.sound.isPlaying)
            this.sound.stop();

          // Reproducir sonido del gameover solo una vez
          if (!this.muted && !this.reproducido) // controla si se ha reproducido el sonido de gameover
            this.playGameOver();
        }
      }
    }
    
    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    requestAnimationFrame(() => this.update())
  }
}

$(async function () {
  const translations = await loadTranslations();
  var scene = new MyScene("#WebGL-output", translations);

  window.addEventListener ("resize", () => scene.onWindowResize());
  window.addEventListener ("keydown", (event) => scene.leerTeclado(event));
  window.addEventListener ("mousedown", (event) => scene.leerRaton(event));
  scene.update();
});
