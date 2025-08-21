import * as THREE from '../../libs/three.module.js'
import { Pedunculo } from './Pedunculo.js'

class Pera extends THREE.Object3D {
  constructor() {
    super();
    
    // Se crea el pedunculo, pero no se añade a la escena, solamente se crea un mesh resultante de geometría y material
    this.pedunculo = new Pedunculo();

    this.pedunculo.meshPedunculo.position.y = 4.5;  // subir el rabo
    this.pedunculo.meshPedunculo.scale.set(0.6,0.5,0.6);

    this.pera_sin_rabo = this.createPera();

    this.pera = new THREE.Object3D();       // crear la pera como el conjunto de la propia pera y su rabo
    this.pera.add(this.pera_sin_rabo, this.pedunculo);

    this.pera.scale.set(0.2, 0.2, 0.2);
    this.pera.rotateX(Math.PI/2);
    this.pera.position.set(0.92,0.94,0);
    
    this.add (this.pera);
  }

  createPera()
  {
    var texture = new THREE.TextureLoader().load('./Juego/images/pear.jpg');
    var material_pera = new THREE.MeshPhysicalMaterial({map: texture, roughness: 0, reflectivity: 0.35});

    var shapePera = new THREE.Shape();
    shapePera.lineTo(1, 0);
    shapePera.quadraticCurveTo(2.7, 0.5, 3.5, 1.5);
    shapePera.quadraticCurveTo(7, 4.6, 4, 7);
    shapePera.quadraticCurveTo(4, 7, 1.7, 10);
    shapePera.quadraticCurveTo(1, 11, 0, 10.5);

    var puntos = shapePera.extractPoints(10).shape;
    var peraGeometry = new THREE.LatheGeometry(puntos, 24);
    peraGeometry.scale(0.65, 0.9, 0.65);  // reducir su ancho
    peraGeometry.scale(0.5, 0.5, 0.5);  // reducirla en general

    var meshPera = new THREE.Mesh(peraGeometry, material_pera);

    meshPera.position.y -= 0.25;

    return meshPera;
  }

  destruirPera(){
    this.pera_sin_rabo.geometry.dispose();
    this.pera_sin_rabo.material.dispose();

    this.pedunculo.meshPedunculo.geometry.dispose();
    this.pedunculo.meshPedunculo.material.dispose();

    this.remove(this.pera_sin_rabo);
    this.remove(this.pedunculo);
    this.remove(this.pera);
  }
  
  
  update () {
  }
}

export { Pera }
