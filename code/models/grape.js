import * as THREE from '../../libs/three.module.js'

class Grape extends THREE.Object3D {
  constructor(gui,titleGui) {
    super();
    
    this.grape = this.createGrape(); //Grape realmente es un racimo de grapes

    this.grape_final = new THREE.Object3D();
    this.grape_final.add(this.grape);

    this.grape_final.scale.set(0.5, 0.5, 0.5);
    this.grape_final.rotateX(Math.PI/2);
    this.grape_final.position.set(0.92,0.92,0);

    this.add (this.grape_final);
  }

  createGrape() {
    // Un Mesh se compone de geometría y material
    var sphereGeom = new THREE.SphereGeometry( 1.5, 100, 100 ); //radio, paralelos y meridianos (norte a sur)
    // Como material se crea uno a partir de un color
    var texture = new THREE.TextureLoader().load('./code/images/grape.jpg'); //añadirle textura de naranja
    var sphereMat = new THREE.MeshPhysicalMaterial({
      map: texture,
      color: 0xad00ad,
      roughness: 0, 
      reflectivity: 0.35
    });

    // Ya podemos construir el Mesh
    this.sphere = new THREE.Mesh (sphereGeom, sphereMat);
    // Y añadirlo como hijo del Object3D (el this)
    this.add (this.sphere);

    this.sphere.scale.y = 1.25;
    this.sphere.scale.set(0.5, 0.7, 0.5);
    this.sphere.position.y = 1;

    return this.sphere;
  }

  destroyGrape(){
    this.grape.geometry.dispose();
    this.grape.material.dispose();

    this.remove(this.grape);
    this.remove(this.grape_final);
    this.remove(this.grape);
  }
}

export { Grape }
