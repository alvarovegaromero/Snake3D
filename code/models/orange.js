import * as THREE from '../../libs/three.module.js'
import { OrangeStem } from './orange-stem.js'

class Orange extends THREE.Object3D {
  constructor(gui,titleGui) {
    super();

    this.orangeStem = new OrangeStem();
    this.orangeStem.scale.set(0.5,0.5,0.5)
    this.orangeStem.position.y += 3;

    this.orange = this.createOrange();

    this.completedOrange = new THREE.Object3D();       // crear la naranja como el conjunto de la propia naranja y su rabo
    this.completedOrange.add(this.orangeStem, this.orange);

    this.completedOrange.scale.set(0.3, 0.3, 0.3);
    this.completedOrange.rotateX(Math.PI/2);
    this.completedOrange.position.set(0.9,0.9,0);

    this.add (this.completedOrange);
  }

  destroyOrange(){
    this.orange.geometry.dispose();
    this.orange.material.dispose();

    this.orangeStem.stem.geometry.dispose();
    this.orangeStem.stem.material.dispose();

    this.remove(this.orange);
    this.remove(this.orangeStem);
    this.remove(this.completedOrange);
  }

  createOrange()
  {
    // Un Mesh se compone de geometría y material
    var sphereGeom = new THREE.SphereGeometry( 1.5, 100, 100 ); //radio, paralelos y meridianos (norte a sur)
    // Como material se crea uno a partir de un color
    var texture = new THREE.TextureLoader().load('./code/images/orange.jpg'); //añadirle textura de naranja
    var sphereMat = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0,
    });

    // Ya podemos construir el Mesh
    this.sphere = new THREE.Mesh (sphereGeom, sphereMat);
    // Y añadirlo como hijo del Object3D (el this)

    this.sphere.position.y = 1.5;

    return this.sphere;
  }
}

export { Orange }
