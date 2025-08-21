import * as THREE from '../../libs/three.module.js'
import { PedunculoNaranja } from './PedunculoNaranja.js'

class Naranja extends THREE.Object3D {
  constructor(gui,titleGui) {
    super();
    
    this.pedunculoNaranja = new PedunculoNaranja();
    this.pedunculoNaranja.scale.set(0.5,0.5,0.5)
    this.pedunculoNaranja.position.y += 3;

    this.naranja = this.createNaranja();
    
    this.naranjaEntera = new THREE.Object3D();       // crear la manzana como el conjunto de la propia manzana y su rabo
    this.naranjaEntera.add(this.pedunculoNaranja, this.naranja);

    this.naranjaEntera.scale.set(0.3, 0.3, 0.3);
    this.naranjaEntera.rotateX(Math.PI/2);
    this.naranjaEntera.position.set(0.9,0.9,0);
    
    this.add (this.naranjaEntera);
  }

  destruirNaranja(){
    this.naranja.geometry.dispose();
    this.naranja.material.dispose();

    this.pedunculoNaranja.rabo.geometry.dispose();
    this.pedunculoNaranja.rabo.material.dispose();

    this.remove(this.naranja);
    this.remove(this.pedunculoNaranja);
    this.remove(this.naranjaEntera);
  }

  createNaranja()
  {
    // Un Mesh se compone de geometría y material
    var sphereGeom = new THREE.SphereGeometry( 1.5, 100, 100 ); //radio, paralelos y meridianos (norte a sur)
    // Como material se crea uno a partir de un color
    var texture = new THREE.TextureLoader().load('./Juego/images/naranja.jpg'); //añadirle textura de naranja
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

  
  
  update () {
  }
}

export { Naranja }
