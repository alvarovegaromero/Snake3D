import * as THREE from '../libs/three.module.js'
import {Direcciones} from './Escena.js'
import {ValoresMatriz} from './Escena.js'

/*
Apartados del fichero:
- Mensajes
- Gestion matriz
- Gestión cabeza
- Movimiento serpiente
- Funcionalidades frutas
*/

class Snake extends THREE.Object3D{
    
    constructor(dimensionesX, dimensionesY, tamMatrizX, tamMatrizY) {
        super();

        ///////////////////////////////
        // Definimos los tamaños de los cubos de la serpiente
        this.tamX = 1;
        this.tamY = 1;
        this.tamZ = 1;

        //Guardamos los tamaños de la matriz del tablero
        this.tamMatrizX = tamMatrizX;
        this.tamMatrizY = tamMatrizY;

        ///////////////////////////////
        // Control del fin del juego
        this.finPartida = false; // Booleano para avisar si se ha perdido el juego

        ///////////////////////////////
        // Propiedades iniciales de la serpiente
        this.direccion = Direcciones.ARRIBA; // Inicialmente, la serpiente empieza mirando a la derecha
        this.velocidadSerpiente = 5; //Velocidad de la serpiente
        
        ///////////////////////////////
        //Crear estructuras para la gestion de la serpiente
        this.segmentosSnake = []; //Guarda cada mesh que forma un segmento en el snake
    
        // IMPORTANTE, la y es la fila, x la columna
        this.crearMatriz();

        ///////////////////////////////
        // Para controlar el movimiento de la serpiente
        this.reloj = new THREE.Clock(); 
        this.contadorSegundos = 1; //Valor para la recarga de frames. A mayor valor, menor recarga de frames
        this.total_delta = 0;

        /////////////////////////////////////////////////////////////
        //Crear textura, geometria y material comun de la la serpiente
        this.texture = new THREE.TextureLoader().load('./Imagenes/serpiente2.jpg');
        this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
        this.texture.repeat.set( 0.3, 0.3 );
        this.texture.needsUpdate = true;
        
        this.material = new THREE.MeshPhongMaterial({map: this.texture});

        // Crear cubos redondeados para el resto de segmentos
        var shape = new THREE.Shape();
        shape.moveTo(0.25,0.25);
        shape.lineTo(0.5,0.25);
        shape.quadraticCurveTo(0.75,0.25, 0.75,0.5);

        shape.lineTo(0.75,0.75);
        shape.quadraticCurveTo(0.75,1, 0.5,1);

        shape.lineTo(0.25,1);
        shape.quadraticCurveTo(0,1, 0,0.75);

        shape.lineTo(0,0.5);
        shape.quadraticCurveTo(0,0.25, 0.25,0.25);
        
        const extrudeSettings = {
            steps: 2,
            depth: 1,
            bevelEnabled: true,
            bevelThickness: 0.75,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 3
        };
    
        this.geometria = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        this.geometria.translate(-0.4, 0, -0.5);
        this.geometria.scale(0.35, 0.3, 0.45);
        this.geometria.rotateX(Math.PI/2);
        
        ///////////////////////////////
        // CREAR y COLOCAR LA CABESA - PIEZA INICIAL
        this.geometria_cabeza = new THREE.CylinderGeometry(0.5, 0.5, 1);
        this.geometria_cabeza.translate(0.4,0,0);
        this.geometria_cabeza.rotateY(-Math.PI/2);

        var texture_cabeza = new THREE.TextureLoader().load('./Imagenes/cabeza.jpg');
        texture_cabeza.repeat.set(2,1);
        var materiales_cabeza = [new THREE.MeshPhongMaterial({map: texture_cabeza}), new THREE.MeshPhongMaterial({map: this.texture}), new THREE.MeshPhongMaterial({map: this.texture})];
        
        var cabeza = new THREE.Mesh(this.geometria_cabeza, materiales_cabeza);
        cabeza.position.set(dimensionesX/2-this.tamX/2, dimensionesY/2-this.tamY/2, 0); //Colocarlo abajo e izquierda del centro. Posicion inicial
   
        this.add(cabeza);

        // Añadir cabeza a segmentosSnake y poner a TRUE que esta ocupada esa poisicion
        this.segmentosSnake.push(cabeza); //Metemos la cabeza lo primero

        //Marcamos la pos inicial como ocupada
        this.matriz[this.conviertePosicionEnIndice(cabeza.position.y)][this.conviertePosicionEnIndice(cabeza.position.x)] = ValoresMatriz.SERPIENTE; 
    
  
    }

    // Destruir todos los meshes, geometrías y materiales de todos los segmentos de la serpiente (incluido cabeza)
    eliminarSerpiente(){

        for (var i=0; i<this.segmentosSnake; i++){
            this.segmentosSnake[i].geometry.dispose();
            this.segmentosSnake[i].material.dispose();
        }
    }

    //////////////////////////////////////////////////
    // MENSAJES
    //////////////////////////////////////////////////

    setMessage (str) {
        document.getElementById ("Messages").innerHTML += "<h2>"+str+"</h2>";
    }
 
    clearMessage(){
        document.getElementById ("Messages").innerHTML = "";
    }

    setGameOver (str) {
        document.getElementById ("gameover").innerHTML += "<h2>"+str+"</h2>";
    }

    //////////////////////////////////////////////////
    // FIN MENSAJES
    //////////////////////////////////////////////////


    //////////////////////////////////////////////////
    // GESTION MATRIZ
    //////////////////////////////////////////////////

    //Dada una posición con decimales, le eliminamos los decimales para convertirlo a entero y le restamos uno para ver su correspondencia en la matriz
    conviertePosicionEnIndice(posicion){
        return (Math.trunc(posicion)-1);
    }

    //Crea una matriz de enteros. Una celda vale 1 si hay un segmento de la serpiente ocupando esa casilla y 0 si no. (y mas valores si hay fruta)
    // IMPORTANTE, la y es la fila, x la columna
    crearMatriz(){
        this.matriz = new Array(this.tamMatrizY);

        for(var i = 0; i < this.tamMatrizY ; i++){
            this.matriz[i] = new Array(this.tamMatrizX);

            for(var j = 0 ; j < this.tamMatrizX ; j++){
                this.matriz[i][j] = ValoresMatriz.VACIO;
            }
        }
    }

    // Comprueba si una casilla de la matriz está ya ocupada por la serpiente. Si lo está, detectamos que ha habido un choque
    comprobarCasillaOcupada(fila, columna){
        if(this.matriz[fila][columna] === ValoresMatriz.SERPIENTE)
            return true;
        else //Si esta vacía o hay frutas, no hacer nada. Las frutas se procesan en la escena
            return false;
    }

    //Permite cambiar el valor de una celda en la matriz
    setCeldaMatriz(fila, columna, valor){
        this.matriz[fila][columna] = valor;
    }

    //Permite ver el valor que hay en una celda de la matriz
    getCeldaMatriz(fila, columna){
        return this.matriz[fila][columna];
    }

    //Comprueba si en la posición hay alguna fruta. Si hay, devuelve true
    comprobarPosicionFrutas(fila, columna){
        if(
            (this.getCeldaMatriz(fila, columna) !== ValoresMatriz.VACIO) && 
            (this.getCeldaMatriz(fila, columna) !== ValoresMatriz.SERPIENTE)
        )
            return true; //Si lo que hay no es vacio ni snake, es una fruta
        else
            return false;
    }

    //////////////////////////////////////////////////
    // FIN GESTION MATRIZ
    //////////////////////////////////////////////////

    //////////////////////////////////////////////////
    // GESTION CABEZA
    //////////////////////////////////////////////////

    //Permite obtener la columna ocupada en la matriz por la cabeza - OJO la Columna es la X
    getColumnaCabeza(){
        return this.conviertePosicionEnIndice(this.segmentosSnake[0].position.x);
    }
    
    //Permite obtener la fila ocupada en la matriz por la cabeza - OJO la Fila es la Y
    getFilaCabeza(){
        return this.conviertePosicionEnIndice(this.segmentosSnake[0].position.y);
    }

    //Comprueba si la posicion en la que está la cabeza, es un muro. Si es muro, devuelve true al haber choque
    comprobarChoqueMuro(fila, columna){
        if((fila < 0) || (fila >= this.tamMatrizY))
            return true; //Hay choque horizontalmente
        else if((columna < 0) || (columna >= this.tamMatrizX))
            return true; //Choque verticalmente
        else
            return false;
        
    }

    //Una vez se ha movido la cabeza. Comprobar si todo ha ido bien, y si es así, marca la casilla de la cabeza como ocupada
    procesarCasilla(){
        var fila_cabeza = this.getFilaCabeza();
        var columna_cabeza = this.getColumnaCabeza();

        if(this.comprobarChoqueMuro(fila_cabeza, columna_cabeza)) //Si hay choque con muro, perder
            this.perderJuego();
        else if (this.comprobarCasillaOcupada(fila_cabeza, columna_cabeza)) //Si estaba la posicion ocupada por la serpiente, perder
            this.perderJuego();
        //Por ultimo, si no es una posicion de fruta o bomba (procesada en escena en caso de que lo fuera), marcarla como ocupada por la serpiente
        else if(!this.comprobarPosicionFrutas(fila_cabeza, columna_cabeza)) 
            this.matriz[fila_cabeza][columna_cabeza] = ValoresMatriz.SERPIENTE;   
    }

    //Permite cambiar la dirección a la que se dirige el snake
    cambiarDireccion(direccion_elegida){

        // Evita que el jugador quiera moverse en la misma dirección en la que se está
        // moviendo pero en diferente sentido. Es decir si:

        // Se está moviendo hacia arriba y le da hacia abajo, no hacer nada
        // Se está moviendo hacia derecha y le da hacia la izquierda, no hacer nada
        // Se está moviendo hacia abajo y le da hacia arriba, no hacer nada
        // Se está moviendo hacia izquierda y le da hacia la derecha, no hacer nada

        let cambio = false; // controla si ha habido cambio de direccion

        if (this.direccion!=direccion_elegida) // Si la direccion marcada es diferente a la previa, procesarla
        {

            if (this.direccion == Direcciones.ARRIBA && direccion_elegida != Direcciones.ABAJO) {
                this.direccion = direccion_elegida;
                cambio = true;
            }
                
            else if (this.direccion == Direcciones.DERECHA && direccion_elegida != Direcciones.IZQUIERDA) {
                this.direccion = direccion_elegida;
                cambio = true;
            }
                
            else if (this.direccion == Direcciones.ABAJO && direccion_elegida != Direcciones.ARRIBA) {
                this.direccion = direccion_elegida;
                cambio = true;
            }
                
            else if (this.direccion == Direcciones.IZQUIERDA && direccion_elegida != Direcciones.DERECHA) {
                this.direccion = direccion_elegida;
                cambio = true;
            }

            // Si se ha cambiado de direccion, rotamos la cabeza
            if (cambio){
                var cabeza = this.segmentosSnake[0];

                if (this.direccion==Direcciones.DERECHA)
                    cabeza.rotation.z -= Math.PI/2;
                else if (this.direccion==Direcciones.IZQUIERDA)
                    cabeza.rotation.z += Math.PI/2;
                else if (this.direccion==Direcciones.ARRIBA)
                    cabeza.rotation.z += Math.PI/2;
                else if (this.direccion==Direcciones.ABAJO)
                    cabeza.rotation.z -= Math.PI/2;   
            }
        }
    }

    //////////////////////////////////////////////////
    // FIN GESTION CABEZA
    //////////////////////////////////////////////////


    //////////////////////////////////////////////////
    // MOVIMIENTO SERPIENTE
    //////////////////////////////////////////////////
    
    // Permite mover a la serpiente a la posición que le indique el parámetro dirección
    moverSerpiente() {

        var cabeza = this.segmentosSnake[0];
        var cola = this.segmentosSnake[this.segmentosSnake.length-1];

        // Si en la ultima iteraccion no se creo un segmento, marcar como vacio la posicion donde estaba la cola.
        // Si se creó, esa posicion es la que ocupa el ultimo segmento creado
        if(!this.hecreadosegmento) 
            this.matriz[this.conviertePosicionEnIndice(cola.position.y)][this.conviertePosicionEnIndice(cola.position.x)] = ValoresMatriz.VACIO; 

        // Desplazar los segmentos "a la izquierda" del vector, haciendo que sigan al siguiente segmento hasta la cabeza y adoptando su orientación
        for(var i = this.segmentosSnake.length-1; i > 0; i--){
            this.segmentosSnake[i].position.x = this.segmentosSnake[i-1].position.x; 
            this.segmentosSnake[i].position.y = this.segmentosSnake[i-1].position.y;

            this.segmentosSnake[i].rotation.z = this.segmentosSnake[i-1].rotation.z; //Orientacion de los segmentos
        }

        //En función de la dirección del snake, mover la cabeza hacia ese sitio.
        if (this.direccion == Direcciones.DERECHA) 
            cabeza.position.x += this.tamX; 

        else if (this.direccion == Direcciones.IZQUIERDA) 
            cabeza.position.x -= this.tamX;

        else if (this.direccion == Direcciones.ARRIBA)
            cabeza.position.y += this.tamY;

        else if (this.direccion == Direcciones.ABAJO)
            cabeza.position.y -= this.tamY;

    }
    
    //////////////////////////////////////////////////
    // FIN MOVIMIENTO SERPIENTE
    //////////////////////////////////////////////////

    //////////////////////////////////////////////////
    // FUNCIONALIDADES FRUTAS
    //////////////////////////////////////////////////

    //Finaliza la partida directamente
    perderJuego(){ //Además, pieza asociada = bomba
        this.finPartida = true;

        this.clearMessage();
        this.setGameOver("GAME OVER");
        this.setMessage("Pulsa R para reiniciar");
    }

    // Incrementa el tamaño del snake.
    incrementarTamanio() { // Fruta asociada = Manzana
        var cola = this.segmentosSnake[this.segmentosSnake.length-1];
        var segmento = new THREE.Mesh(this.geometria, this.material);
        segmento.rotation.z = cola.rotation.z;
        segmento.position.set(cola.position.x, cola.position.y, 0); //Colocarlo en la posicion de la cola
        
        //Marcar como ocupado
        this.matriz[this.conviertePosicionEnIndice(segmento.position.y)][this.conviertePosicionEnIndice(segmento.position.x)] = ValoresMatriz.SERPIENTE;

        this.add(segmento);
        this.hecreadosegmento = true;

        this.segmentosSnake.push(segmento); //Metemos el segmento al vdector
    }

    // Decrementa el tamaño del snake. En caso de perder todos los segmentos, se pierde la partida
    decrementarTamanio() { // Fruta asociada = Uva
        var cola = this.segmentosSnake[this.segmentosSnake.length-1];
        
        if (this.segmentosSnake.length>1){
            
            this.matriz[this.conviertePosicionEnIndice(cola.position.y)][this.conviertePosicionEnIndice(cola.position.x)] = ValoresMatriz.VACIO; 
            
            // Eliminar geometría, material y el propio objeto del ultimo segmento
            cola.geometry.dispose();
            cola.material.dispose();
            this.remove(cola);
            this.segmentosSnake.pop();
        }
        else // Si la serpiente solo tiene la cabeza se acaba el juego
            this.perderJuego();
    }

    //Aumenta la velocidad del Snake
    aumentarVelocidad() { // Fruta asociada = Pera
        if(this.velocidadSerpiente < 12) //Solo si es hay algo de velocidad, permitir reducirla
            this.velocidadSerpiente += 1;
    }

    //Reduce la velocidad del Snake
    reducirVelocidad() {  // Fruta asociada = Naranja
        if(this.velocidadSerpiente > 2) //Solo si es hay algo de velocidad, permitir reducirla
            this.velocidadSerpiente -= 1;
    }

    //////////////////////////////////////////////////
    // FIN FUNCIONALIDADES FRUTAS
    //////////////////////////////////////////////////

    update () {
        //Cada vez que total_delta * velocidad sea > 1, actualiza el juego. Si la velocidad es más o menos grande, requerirá menos tiempo
        // y por tanto, irá más o menos rápido
        this.total_delta = this.total_delta + this.reloj.getDelta();

        if(!this.finPartida){ //Si no se ha terminado la partida actual
            if((this.total_delta * this.velocidadSerpiente) > this.contadorSegundos) 
            {
                this.total_delta = 0;         

                this.moverSerpiente();
                this.procesarCasilla();

                if(this.hecreadosegmento) //Si habiamos creado un segmento, desactivar el flag despues de crearlo
                    this.hecreadosegmento = false;
            }
        }
    }
}

export { Snake }
