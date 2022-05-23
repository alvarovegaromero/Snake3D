import * as THREE from '../../libs/three.module.js'

class PedunculoNaranja extends THREE.Object3D {
  constructor() {
    super();
    
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    
    // A la base no se accede desde ningún método. Se almacena en una variable local del constructor.
    //var pedunculo = this.createPedunculo();

    var material = new THREE.MeshPhongMaterial({color: 0x18E300});

    var geoPentagono = new THREE.Shape();
    geoPentagono.moveTo(5-5,-1.8+5);
    geoPentagono.lineTo(3.9-5,-3.7+5);
    geoPentagono.lineTo(1.7-5,-4.3+5);
    geoPentagono.lineTo(3.1-5,-6+5);
    geoPentagono.lineTo(2.9-5,-8.2+5);
    geoPentagono.lineTo(5-5,-7.3+5);
    geoPentagono.lineTo(7.1-5,-8.2+5);
    geoPentagono.lineTo(6.9-5,-6+5);
    geoPentagono.lineTo(8.3-5,-4.3+5);
    geoPentagono.lineTo(6.1-5,-3.7+5);
    geoPentagono.lineTo(5-5,-1.8+5);

    var options = {steps: 5};
    var geometry = new THREE.ExtrudeGeometry(geoPentagono, options);
    geometry.rotateX(Math.PI/2);
    geometry.scale(0.25, 0.25, 0.25);

    this.meshPentagono = new THREE.Mesh(geometry, material);

    this.geoRabo = new THREE.CylinderGeometry (0.25, 0.25, 0.7, 50);

    this.rabo = new THREE.Mesh (this.geoRabo, material);
    this.rabo.position.y = 0.35;  // subir el rabo

    var pedunculoCompleto = new THREE.Object3D();       // crear la manzana como el conjunto de la propia manzana y su rabo
    pedunculoCompleto.add(this.meshPentagono)
    pedunculoCompleto.add(this.rabo)

    this.add(pedunculoCompleto);
  }
}

export { PedunculoNaranja }
