import * as THREE from '../../libs/three.module.js'
import { Pedunculo } from './Pedunculo.js'

class Manzana extends THREE.Object3D {
  constructor() {
    super();
    
    // Se crea el pedunculo, pero no se añade a la escena, solamente se crea un mesh resultante de geometría y material
    this.pedunculo = new Pedunculo();

    this.pedunculo.meshPedunculo.position.y = 3.5;  // subir el rabo

    this.manzana_sin_rabo = this.createManzana();

    this.manzana = new THREE.Object3D();       // crear la manzana como el conjunto de la propia manzana y su rabo
    this.manzana.add(this.manzana_sin_rabo, this.pedunculo);
    
    this.manzana.scale.set(0.2, 0.2, 0.2);
    this.manzana.rotateX(Math.PI/2);
    this.manzana.position.set(0.95,0.95,0);

    this.add (this.manzana);
  }

  destruirManzana(){
    this.manzana_sin_rabo.geometry.dispose();
    this.manzana_sin_rabo.material.dispose();

    this.pedunculo.meshPedunculo.geometry.dispose();
    this.pedunculo.meshPedunculo.material.dispose();

    this.remove(this.manzana_sin_rabo);
    this.remove(this.pedunculo);
    this.remove(this.manzana);
  }

  createManzana()
  {
    var texture = new THREE.TextureLoader().load('./Juego/images/manzana.jpg');
    var material_manzana = new THREE.MeshPhysicalMaterial({map: texture, roughness: 0, reflectivity: 0.35});

    var shapeManzana = new THREE.Shape();
    shapeManzana.moveTo(0, 2);
    shapeManzana.quadraticCurveTo(2, -1, 4.5, 2);
    shapeManzana.quadraticCurveTo(7.5, 5, 6, 7.5);
    shapeManzana.quadraticCurveTo(3, 12, 0, 7);

    var puntos = shapeManzana.extractPoints(10).shape;
    var manzanaGeometry = new THREE.LatheGeometry(puntos, 24);
    manzanaGeometry.scale(0.8, 1, 0.8);  // reducir su ancho
    manzanaGeometry.scale(0.5, 0.5, 0.5);  // reducirla en general

    var meshManzana = new THREE.Mesh(manzanaGeometry, material_manzana);

    meshManzana.position.y -= 0.25;

    return meshManzana;
  }
  
  
  update () {
  }
}

export { Manzana }
