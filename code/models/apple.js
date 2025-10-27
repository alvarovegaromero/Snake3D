import * as THREE from '../../libs/three.module.js'
import { Stem } from './stem.js'

class Apple extends THREE.Object3D {
  constructor() {
    super();
    
    // Create the stem (mesh only, not added to scene yet)
    this.stem = new Stem();
    this.stem.meshStem.position.y = 3.5; // raise the stem

    this.appleBody = this.createApple();

    this.appleGroup = new THREE.Object3D(); // group for apple and stem
    this.appleGroup.add(this.appleBody, this.stem);

    this.appleGroup.scale.set(0.2, 0.2, 0.2);
    this.appleGroup.rotateX(Math.PI / 2);
    this.appleGroup.position.set(0.95, 0.95, 0);

    this.add(this.appleGroup);
  }

  destroyApple() {
    this.appleBody.geometry.dispose();
    this.appleBody.material.dispose();

    this.stem.meshStem.geometry.dispose();
    this.stem.meshStem.material.dispose();

    this.appleGroup.remove(this.appleBody);
    this.appleGroup.remove(this.stem);
    this.remove(this.appleGroup);
  }

  createApple() {
    const texture = new THREE.TextureLoader().load('./code/images/apple.jpg');
    const material = new THREE.MeshPhysicalMaterial({ map: texture,
                                                      roughness: 0,
                                                      reflectivity: 0.35 });

    const shape = new THREE.Shape();
    shape.moveTo(0, 2);
    shape.quadraticCurveTo(2, -1, 4.5, 2);
    shape.quadraticCurveTo(7.5, 5, 6, 7.5);
    shape.quadraticCurveTo(3, 12, 0, 7);

    const points = shape.extractPoints(10).shape;
    const geometry = new THREE.LatheGeometry(points, 24);
    geometry.scale(0.4, 0.5, 0.4); // combined scale for width and general size

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y -= 0.25;

    return mesh;
  }
}

export { Apple }
