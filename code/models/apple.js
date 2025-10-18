import * as THREE from '../../libs/three.module.js'
import { Pedunculo } from './Pedunculo.js'

class Apple extends THREE.Object3D {
  constructor() {
    super();
    
    // Se crea el pedunculo, pero no se añade a la escena, solamente se crea un mesh resultante de geometría y material
    this.pedunculo = new Pedunculo();

    this.pedunculo.meshPedunculo.position.y = 3.5;  // subir el rabo

    this.apple_without_append = this.createApple();

    this.apple = new THREE.Object3D(); // crear la apple como el conjunto de la propia apple y su rabo
    this.apple.add(this.apple_without_append, this.pedunculo);

    this.apple.scale.set(0.2, 0.2, 0.2);
    this.apple.rotateX(Math.PI/2);
    this.apple.position.set(0.95,0.95,0);

    this.add (this.apple);
  }

  destroyApple(){
    this.apple_without_append.geometry.dispose();
    this.apple_without_append.material.dispose();

    this.pedunculo.meshPedunculo.geometry.dispose();
    this.pedunculo.meshPedunculo.material.dispose();

    this.remove(this.apple);
    this.remove(this.pedunculo);
    this.remove(this.apple);
  }

  createApple()
  {
    var texture = new THREE.TextureLoader().load('./code/images/apple.jpg');
    var material_apple = new THREE.MeshPhysicalMaterial({map: texture, roughness: 0, reflectivity: 0.35});

    var shapeApple = new THREE.Shape();
    shapeApple.moveTo(0, 2);
    shapeApple.quadraticCurveTo(2, -1, 4.5, 2);
    shapeApple.quadraticCurveTo(7.5, 5, 6, 7.5);
    shapeApple.quadraticCurveTo(3, 12, 0, 7);

    var puntos = shapeApple.extractPoints(10).shape;
    var appleGeometry = new THREE.LatheGeometry(puntos, 24);
    appleGeometry.scale(0.8, 1, 0.8);  // reducir su ancho
    appleGeometry.scale(0.5, 0.5, 0.5);  // reducirla en general

    var meshApple = new THREE.Mesh(appleGeometry, material_apple);

    meshApple.position.y -= 0.25;

    return meshApple;
  }
}

export { Apple }
