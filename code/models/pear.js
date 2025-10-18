import * as THREE from '../../libs/three.module.js'
import { Stem } from './stem.js'

class Pear extends THREE.Object3D {
  constructor() {
    super();
    
    // Se crea el stem, pero no se añade a la escena, solamente se crea un mesh resultante de geometría y material
    this.stem = new Stem();

    this.stem.meshStem.position.y = 4.5;  // subir el stem
    this.stem.meshStem.scale.set(0.6,0.5,0.6);

    this.pear_without_stem = this.createPear();

    this.pear = new THREE.Object3D(); // crear la pear como el conjunto de la propia pear y su stem
    this.pear.add(this.pear_without_stem, this.stem);

    this.pear.scale.set(0.2, 0.2, 0.2);
    this.pear.rotateX(Math.PI/2);
    this.pear.position.set(0.92,0.94,0);

    this.add (this.pear);
  }

  createPear()
  {
    var texture = new THREE.TextureLoader().load('./code/images/pear.jpg');
    var material_pear = new THREE.MeshPhysicalMaterial({map: texture, roughness: 0, reflectivity: 0.35});

    var shapePear = new THREE.Shape();
    shapePear.lineTo(1, 0);
    shapePear.quadraticCurveTo(2.7, 0.5, 3.5, 1.5);
    shapePear.quadraticCurveTo(7, 4.6, 4, 7);
    shapePear.quadraticCurveTo(4, 7, 1.7, 10);
    shapePear.quadraticCurveTo(1, 11, 0, 10.5);

    var puntos = shapePear.extractPoints(10).shape;
    var pearGeometry = new THREE.LatheGeometry(puntos, 24);
    pearGeometry.scale(0.65, 0.9, 0.65);  // reducir su ancho
    pearGeometry.scale(0.5, 0.5, 0.5);  // reducirla en general

    var meshPear = new THREE.Mesh(pearGeometry, material_pear);

    meshPear.position.y -= 0.25;

    return meshPear;
  }

  destroyPear(){
    this.pear_without_stem.geometry.dispose();
    this.pear_without_stem.material.dispose();

    this.stem.meshStem.geometry.dispose();
    this.stem.meshStem.material.dispose();

    this.remove(this.pear_without_stem);
    this.remove(this.stem);
    this.remove(this.pear);
  }
}

export { Pear }
