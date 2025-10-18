import * as THREE from '../../libs/three.module.js'

class Stem extends THREE.Object3D {
  constructor(colorP = 0x95b211) { //Añadimos color como parametro opcional
    super();
    
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    
    // A la base no se accede desde ningún método. Se almacena en una variable local del constructor.
    //var pedunculo = this.createPedunculo();

    var material = new THREE.MeshPhongMaterial({color: colorP});

    var path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,0,0),
      new THREE.Vector3(0.3,1,0),
      new THREE.Vector3(1,2,0),
      new THREE.Vector3(1.5,2.5,0),
    ]);

    var circuloShape = new THREE.Shape();
    circuloShape.absarc(0,0,0.3);

    var options = {steps: 15, curveSegments: 10, extrudePath: path};
    var geometry = new THREE.ExtrudeGeometry(circuloShape, options);
    geometry.scale(0.7, 0.7, 0.7);

    this.meshStem = new THREE.Mesh(geometry, material);

    this.add(this.meshStem);
  }
}

export { Stem }
