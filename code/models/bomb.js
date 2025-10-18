import * as THREE from '../../libs/three.module.js'
import { Stem } from './stem.js'

class Bomb extends THREE.Object3D {
  constructor() {
    super();
    
    var color = new THREE.Color(0xFFFFFF);
    // Se crea el stem, pero no se añade a la escena, solamente se crea un mesh resultante de geometría y material
    this.stem = new Stem(color);
    this.stem.meshStem.scale.set(0.75,1,0.75);
    this.stem.meshStem.position.y = 2.5; // subir el rabo

    this.bomb = this.createBomb();

    this.bombEntera = new THREE.Object3D(); // crear la bomba como el conjunto de la propia bomba y su mecha
    this.bombEntera.add(this.bomb, this.stem.meshStem);

    this.bombEntera.scale.set(0.3, 0.3, 0.3);
    this.bombEntera.rotateX(Math.PI/2);
    this.bombEntera.position.set(0.94,0.94,0);

    this.add(this.bombEntera);
  }

  createBomb()
  {
    var material_bomb = new THREE.MeshPhysicalMaterial({color: 0x1e1f1f, roughness: 0, reflectivity: 0.9});

    //Obtener los puntos con la ecuacion de la esfera de x^2 + y^2 = r^2
    this.puntos = []; //radio de 1.5
    this.puntos.push (new THREE.Vector3(0.001,-1.5,0));
    this.puntos.push (new THREE.Vector3(0.25,-1.45,0));
    this.puntos.push (new THREE.Vector3(0.5,-1.4,0));
    this.puntos.push (new THREE.Vector3(0.75,-1.3,0));
    this.puntos.push (new THREE.Vector3(1,-1.1,0));
    this.puntos.push (new THREE.Vector3(1.25,-0.8,0));
    this.puntos.push (new THREE.Vector3(1.35,-0.65,0));
    this.puntos.push (new THREE.Vector3(1.45,-0.3,0));
    this.puntos.push (new THREE.Vector3(1.5,0,0));
    this.puntos.push (new THREE.Vector3(1.45,0.3,0));
    this.puntos.push (new THREE.Vector3(1.35,0.65,0));
    this.puntos.push (new THREE.Vector3(1.25,0.8,0));
    this.puntos.push (new THREE.Vector3(1,1.1,0));
    this.puntos.push (new THREE.Vector3(0.75,1.3,0));
    this.puntos.push (new THREE.Vector3(0.5,1.4,0));
    this.puntos.push (new THREE.Vector3(0.25,1.45,0));
    this.puntos.push (new THREE.Vector3(0.001,1.5,0));

    var geoBomb = new THREE.LatheGeometry(this.puntos, 24, 0, 2 * Math.PI); //Array de perfil, segmentos, angulo inicial y longitud del gir
    //Me apetecia hacer la esfera con puntos porque soy un chulo sorry xd

    var bomb = new THREE.Mesh(geoBomb, material_bomb);
    bomb.position.y += 1.5;

    return bomb;
  }

  destroyBomb(){
    this.bomb.geometry.dispose();
    this.bomb.material.dispose();

    this.stem.meshStem.geometry.dispose();
    this.stem.meshStem.material.dispose();

    this.remove(this.bomb);
    this.remove(this.stem);
    this.remove(this.bombEntera);
  }
}

export { Bomb }
