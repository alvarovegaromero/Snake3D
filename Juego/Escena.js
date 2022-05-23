
// Clases de la biblioteca

import * as THREE from '../libs/three.module.js'
import { GUI } from '../libs/dat.gui.module.js'
import { TrackballControls } from '../libs/TrackballControls.js'

// Clases de mi proyecto

import { Manzana } from './Modelos/Manzana.js'
import { Uva } from './Modelos/Uva.js'
import { Naranja } from './Modelos/Naranja.js'
import { Pera } from './Modelos/Pera.js'
import { Bomba } from './Modelos/Bomba.js'
import { Snake } from './Snake.js'

/*
Apartados:
- Mensajes
- Música
- Funciones de la escena
- Teclado
- Comida
*/

/*
- camara
- dispose (eliminar serpiente y frutas)
- textura
- raton TODO
 */


//El tablero no es perfecto, cada casilla mide 1.0125. Por eso, necesitamos convertir un valor de la matriz a la posicion real con este factor
const factor_conversion_mapa = 1.0125;

//Tamaño que ocupa el borde del tablero en X e Y
const tamanio_borde = 0.45;

 class MyScene extends THREE.Scene {
  // Recibe el  div  que se ha creado en el  html  que va a ser el lienzo en el que mostrar
  // la visualización de la escena
  constructor (myCanvas) { 
    super();

    //this.target = new THREE.Object3D();

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
    this.setMessage("Pulsa R para iniciar el juego");
    this.setMessage("Creado por: David Correa y Álvaro Vega");
  }

  //////////////////////////////////////////////////
  // MENSAJES
  //////////////////////////////////////////////////

  // Enseñar un mensaje por pantalla
  clearMessage(){
    document.getElementById ("Messages").innerHTML = "";
  }

  // Limpia apartado mensajes
  setMessage (str) {
    document.getElementById ("Messages").innerHTML += "<h2>"+str+"</h2>";
  }

  // Limpia apartado de las teclas
  clearTeclas(){
    document.getElementById ("Teclas").innerHTML = "";
  }

  // Escribe mensajes en el apartado de las teclas
  setTeclas (str) {
    document.getElementById ("Teclas").innerHTML += "<h2>"+str+"</h2>";
  }

  // Escribe mensaje de pausa
  setPausa (str) {
    document.getElementById ("Pausa").innerHTML += "<h2>"+str+"</h2>";
  }

  // Elimina mensaje de pausa
  clearPausa(){
    document.getElementById ("Pausa").innerHTML = "";
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
    audioLoader.load('./Juego/Musica/CancionSnake.mp3',
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
    audioLoader.load('./Juego/Musica/gameover2.mp3',
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

  // Función para el mute
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

  // Play/Stop de la música
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
    
    //this.camera.position.set (this.tamTableroX/2, this.tamTableroY/2, 22.5); //Colocarlo en el eje y para ver el mapa desde arriba
    this.camera.position.set (8, 8, 22.5); //Colocarlo en el eje y para ver el mapa desde arriba

    //var look = new THREE.Vector3 (this.tamTableroX/2,this.tamTableroY/2,0);
    var look = new THREE.Vector3 (8,8,0);

    this.camera.lookAt(look);
    this.add (this.camera);
    
    // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
    this.cameraControl = new TrackballControls (this.camera, this.renderer.domElement);
    
    // Se configuran las velocidades de los movimientos
    this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = -2;
    this.cameraControl.panSpeed = 0.5;
    // Debe orbitar con respecto al punto de mira de la cámara
    this.cameraControl.target = look;
    
  }

  createCamera2 () {
    this.camera2 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    //var look = new THREE.Vector3 (this.tamTableroX/2,this.tamTableroY/2,0);
    var look = new THREE.Vector3 (8,8,0);

    //this.camera2.lookAt(look);
    this.add (this.camera2);
    
    // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
    this.camera2Control = new TrackballControls (this.camera2, this.renderer.domElement);
    
    // Se configuran las velocidades de los movimientos
    this.camera2Control.rotateSpeed = 5;
    this.camera2Control.zoomSpeed = -2;
    this.camera2Control.panSpeed = 0.5;
    // Debe orbitar con respecto al punto de mira de la cámara
    this.camera2Control.target = look;
    
  }

  createGround () {
    
    // La geometría es una caja con muy poca altura
    var geometryGround = new THREE.BoxGeometry (this.tamTableroX,this.tamTableroY, 0.2); 
    
    var texture = new THREE.TextureLoader().load('./Juego/Imagenes/cesped3.0.jpg');
    var materialGround = new THREE.MeshPhongMaterial ({map: texture});
    
    this.ground = new THREE.Mesh (geometryGround, materialGround);
    
    // El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
    this.ground.position.z = -0.1;

    this.ground.position.x += this.tamTableroX/2;
    this.ground.position.y += this.tamTableroY/2;

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
    // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
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

    if(this.inicioJuego) //Si se ha iniciado el juego (y hay una snake), permitir que se pueda modificar la dirección del snake
    {
      if(x == '87'){ //Pulsar la W
        this.snake.cambiarDireccion(Direcciones.ARRIBA);
      }
      else if(x == '83'){ //Pulsar la S
        this.snake.cambiarDireccion(Direcciones.ABAJO);
      }
      else if(x == '65'){ //Pulsar la A
        this.snake.cambiarDireccion(Direcciones.IZQUIERDA);
      }
      else if(x == '68'){ // Pulsar la D
        this.snake.cambiarDireccion(Direcciones.DERECHA);
      }

      else if (x == '77') // Pulsar la M: activamos/desactivamos la musica
      this.cambiarMusica();

      else if(x == '80'){ // Pulsar la P: pausa
        this.pausa = !this.pausa;

        if (this.pausa)
        {
          if (!this.muted)
            this.sound.pause();
          this.setPausa("PAUSA");
        }
        else{
          if (!this.muted)
            this.sound.play();
          this.clearPausa();
        }
      }

      else if(x == '67'){ // Pulsar la C, cambio de cámara
        this.cambio_camara = !this.cambio_camara;
      }
    }
    
    if(x == '82'){ // Pulsar la R. Permite iniciar y reiniciar el juego

      //Si ya habia una partida antes, borrar las cosas que habia
      if (this.inicioJuego){ 
        this.snake.eliminarSerpiente();
        this.remove(this.snake); // Borrar de DOM

        this.eliminarFrutas(); //Eliminar material y geometría de las frutas

        // Limpieza de memoria
        this.renderer.renderLists.dispose();
      }

      if (!this.muted)
        this.reiniciarMusica();
      
      this.reproducido = false; // controla si se ha reproducido el sonido de gameover

      this.clearMessage();
      this.clearTeclas();
      this.setMessage("Las posibles frutas son:");
      
      this.setMessage("-Manzana: Aumentar tamaño");
      this.setMessage("-Pera: Aumentar velocidad");

      this.setMessage("-Uva: Reducir tamaño");
      this.setMessage("-Naranja: Reducir velocidad");
      this.setMessage("-Bomba: Game Over");

      this.setTeclas("W: arriba");
      this.setTeclas("A: izquierda");
      this.setTeclas("S: abajo");
      this.setTeclas("D: derecha");

      this.setTeclas("C: cambiar cámara");
      this.setTeclas("P: pausa");
      this.setTeclas("M: iniciar/pausar música");
      this.setTeclas("R: reiniciar");
      
      this.inicioJuego = true;
      this.snake = new Snake(this.tamTableroX, this.tamTableroY, this.numeroCasillasX, this.numeroCasillasY);

      this.createCamera2();
      this.camera2.lookAt(this.snake.segmentosSnake[0].position.x+10, this.snake.segmentosSnake[0].position.y+55, -150);

      this.crearFrutas();
      
      this.add(this.snake);
    }
  }

  //////////////////////////////////////////////////
  // FIN TECLADO
  //////////////////////////////////////////////////

  //////////////////////////////////////////////////
  // RATON
  //////////////////////////////////////////////////

  // Leer una posicion del
  leerRaton(evento){

    var objetos = [this.ground]; //Objetos seleccionables - El tablero sobre el que haremos click

    var mouse = new THREE.Vector2 ();

    mouse.x = (evento.clientX / window.innerWidth) * 2 - 1;
    mouse.y = 1 - 2 * (evento.clientY / window.innerHeight);

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

      /*
      console.log("Distancia x:", distancia_x); 
      console.log("Distancia y:", distancia_y); 
      */

      // La serpiente irá a la dirección en la que haya más distancia
      // Destacamos que no se puede cambiar el sentido directamente debido a los condicionales del metodo CambiarDireccion

      if(Math.abs(distancia_x) > Math.abs(distancia_y)) // Si la distancia de X es mayor que Y. Iremos a la izq o dcha
      {
        if(distancia_x > 0) //Si la diferencia es positiva, la posicion marcada esta a la derecha
          this.snake.cambiarDireccion(Direcciones.DERECHA);
        else
          this.snake.cambiarDireccion(Direcciones.IZQUIERDA);
      }

      else if (Math.abs(distancia_x) < Math.abs(distancia_y)) // Si la distancia de X es mayor que Y. Iremos arriba o abajo
      {
        if(distancia_y > 0) //Si la diferencia es positiva, la posicion marcada esta arriba
          this.snake.cambiarDireccion(Direcciones.ARRIBA);
        else
          this.snake.cambiarDireccion(Direcciones.ABAJO);
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

  //Obtiene una celda random vacia, dado un limite de x y limite de y
  obtenerCeldaRandomVacia(max1, max2){

    do {
      var pos_x = Math.floor(Math.random() * max1);
      var pos_y = Math.floor(Math.random() * max2);
    } while (this.snake.getCeldaMatriz(pos_y, pos_x) != ValoresMatriz.VACIO); // obtener casilla aleatoria que no esté ocupada 

    return {pos_x, pos_y}; // floor devuelve entero
  }

  // Si la cabeza del snake esta en una fruta, procesa su acción. Además borra la fruta actual, y crea otra en una posicion random
  procesarComida(){
    var fila_cabeza = this.snake.getFilaCabeza();
    var columna_cabeza = this.snake.getColumnaCabeza();

    var casilla = this.snake.getCeldaMatriz(fila_cabeza, columna_cabeza);
    var celda = this.obtenerCeldaRandomVacia(this.numeroCasillasY, this.numeroCasillasX);;

    if (casilla === ValoresMatriz.MANZANA){
        this.snake.incrementarTamanio();
        this.snake.setCeldaMatriz(fila_cabeza, columna_cabeza, ValoresMatriz.SERPIENTE); //Las serpiente se comio la fruta
        this.manzana.destruirManzana();
        this.remove(this.manzana);

        this.crearManzana(celda.pos_y, celda.pos_x);
    }

    else if (casilla === ValoresMatriz.UVA){
      this.snake.decrementarTamanio();
      this.snake.setCeldaMatriz(fila_cabeza, columna_cabeza, ValoresMatriz.SERPIENTE);
      this.uva.destruirUva();
      this.remove(this.uva);

      this.crearUva(celda.pos_y, celda.pos_x);
    }

    else if (casilla === ValoresMatriz.PERA){
      this.snake.aumentarVelocidad();
      this.snake.setCeldaMatriz(fila_cabeza, columna_cabeza, ValoresMatriz.SERPIENTE);
      this.pera.destruirPera();
      this.remove(this.pera);

      this.crearPera(celda.pos_y, celda.pos_x);
    }

    else if (casilla === ValoresMatriz.NARANJA){
      this.snake.reducirVelocidad();
      this.snake.setCeldaMatriz(fila_cabeza, columna_cabeza, ValoresMatriz.SERPIENTE);
      this.naranja.destruirNaranja();
      this.remove(this.naranja);

      this.crearNaranja(celda.pos_y, celda.pos_x);
    }

    else if (casilla === ValoresMatriz.BOMBA){
      this.snake.setCeldaMatriz(fila_cabeza, columna_cabeza, ValoresMatriz.SERPIENTE);
      this.snake.perderJuego();
      this.bomba.destruirBomba();
      this.remove(this.bomba);
    }
  }

  // Crea todas las frutas en posiciones aleatorias que no estén previamente ocupadas
  crearFrutas(){

    // NOTA IMPORTANTE: Recordamos que la y para nosotros son las filas y la x
    // son las columnas, por eso invertimos los parámetros
    var celda = this.obtenerCeldaRandomVacia(this.numeroCasillasY, this.numeroCasillasX);
    this.crearManzana(celda.pos_y, celda.pos_x);
    
    celda = this.obtenerCeldaRandomVacia(this.numeroCasillasY, this.numeroCasillasX);
    this.crearPera(celda.pos_y, celda.pos_x);

    celda = this.obtenerCeldaRandomVacia(this.numeroCasillasY, this.numeroCasillasX);
    this.crearUva(celda.pos_y, celda.pos_x);

    celda = this.obtenerCeldaRandomVacia(this.numeroCasillasY, this.numeroCasillasX);
    this.crearNaranja(celda.pos_y, celda.pos_x);

    celda = this.obtenerCeldaRandomVacia(this.numeroCasillasY, this.numeroCasillasX);
    this.crearBomba(celda.pos_y, celda.pos_x);
  }
  
  //Elimina todas las frutas que hay en la escena. "Borrado en cascada"
  eliminarFrutas(){
      this.manzana.destruirManzana();
      this.remove(this.manzana);
      
      this.pera.destruirPera();
      this.remove(this.pera);

      this.uva.destruirUva();
      this.remove(this.uva);

      this.naranja.destruirNaranja();
      this.remove(this.naranja);

      this.bomba.destruirBomba();
      this.remove(this.bomba);
  }

  //Creamos en la posición real, dada una fila y columna de la matriz determinada, la manzana. También marcamos en la matriz que hay una manzana
  crearManzana(fila, columna){
    // Reflejar en la matriz que se ha añadido la fruta
    this.snake.setCeldaMatriz(fila, columna, ValoresMatriz.MANZANA);

    this.manzana = new Manzana();
    
    this.manzana.position.set(factor_conversion_mapa*columna, factor_conversion_mapa*fila, 0);

    this.add (this.manzana);
  }

  //Creamos en la posición real, dada una fila y columna de la matriz determinada, la uva. También marcamos en la matriz que hay una uva
  crearUva(fila, columna){
    this.snake.setCeldaMatriz(fila, columna, ValoresMatriz.UVA);

    this.uva = new Uva();
    this.uva.position.set(factor_conversion_mapa*columna, factor_conversion_mapa*fila, 0);

    this.add (this.uva);
  }

  //Creamos en la posición real, dada una fila y columna de la matriz determinada, la pera. También marcamos en la matriz que hay una pera
  crearPera(fila, columna){
    this.snake.setCeldaMatriz(fila, columna, ValoresMatriz.PERA);

    this.pera = new Pera();
    this.pera.position.set(factor_conversion_mapa*columna, factor_conversion_mapa*fila, 0);

    this.add(this.pera);
  }

  //Creamos en la posición real, dada una fila y columna de la matriz determinada, la bomba. También marcamos en la matriz que hay una bomba
  crearBomba(fila, columna){
    this.snake.setCeldaMatriz(fila, columna, ValoresMatriz.BOMBA);

    this.bomba = new Bomba();
    this.bomba.position.set(factor_conversion_mapa*columna, factor_conversion_mapa*fila, 0);

    this.add(this.bomba);
  }

  //Creamos en la posición real, dada una fila y columna de la matriz determinada, la naranja. También marcamos en la matriz que hay una naranja
  crearNaranja(fila, columna){
    this.snake.setCeldaMatriz(fila, columna, ValoresMatriz.NARANJA);

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

    // Se actualiza la posición de la cámara según su controlador
    this.cameraControl.update(); 

    if(this.inicioJuego) //Si ha iniciado, haz el update del snake
    {
      if (!this.pausa)
      {

        if (this.cambio_camara)
        {
          this.renderer.render (this, this.camera2);
          var offset = new THREE.Vector3(this.snake.segmentosSnake[0].position.x, this.snake.segmentosSnake[0].position.y-6, this.snake.segmentosSnake[0].position.z+14);
          
          // Cambia la posicion de la cámara. Lerp interpola entre la posición de la cámara y el offset. No es necesario obtener la posiciones mundiales
          this.camera2.position.lerp(offset, 0.05);
        }

        //this.target.set(this.snake.segmentosSnake[0].position.x, this.snake.segmentosSnake[0].position.y, this.snake.segmentosSnake[0].position.z);
        //this.snake.segmentosSnake[0].getWorldPosition(this.target);
        //this.camera.lookAt(this.target);

        this.snake.update();

        //Para evitar hacer get en una casilla fuera de índice y haya error por los indices
        if(!this.snake.comprobarChoqueMuro(this.snake.getFilaCabeza(), this.snake.getColumnaCabeza())) 
          this.procesarComida(); //Si hay comida en la casilla, la procesa
        
        if(this.snake.finPartida)
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

// Matriz de Snake con enteros
// 0 - libre
// 1 - serpiente
// 2 - manzana
// 3 - naranja
// 4 - pera
// 5 - uva
// 6 - bomba

// La función main
$(function () {
  
  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener ("resize", () => scene.onWindowResize());
  window.addEventListener ("keydown", (event) => scene.leerTeclado(event)); //Cuando se pulse la tecla, salta el listener
  window.addEventListener ( "mousedown" , (event) => scene.leerRaton(event) ) ;

  // Que no se nos olvide, la primera visualización.
  scene.update();
});

///////////////////////////////
// Enumerado para gestionar las direcciones del Snake
var Direcciones = {
    ARRIBA: 0,
    DERECHA: 1,
    ABAJO: 2,
    IZQUIERDA: 3
}

// Representa el significado de un valor en la matriz del tablero.
var ValoresMatriz = {
  VACIO: 0,
  SERPIENTE: 1,
  MANZANA: 2,
  NARANJA: 3,
  PERA: 4,
  UVA : 5,
  BOMBA : 6
}

export { Direcciones, ValoresMatriz}