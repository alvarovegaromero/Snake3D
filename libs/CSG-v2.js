 
 import {
   BufferAttribute,
   BufferGeometry,
   Mesh,
   Plane,
   Vector2, 
   Vector3
 } from './three.module.js'
 
 // src/CSG/components/BSPNode.js
 var BSPNode = class {
   constructor(polygons) {
     this.plane = null;
     this.front = null;
     this.back = null;
     this.polygons = [];
     if (polygons)
       this.build(polygons);
   }
   clone() {
     const node = new BSPNode();
     node.plane = this.plane && this.plane.clone();
     node.front = this.front && this.front.clone();
     node.back = this.back && this.back.clone();
     node.polygons = this.polygons.map(function(p) {
       return p.clone();
     });
     return node;
   }
   invert() {
     for (let i = 0; i < this.polygons.length; i++) {
       this.polygons[i].negate();
     }
     this.plane.negate();
     if (this.front)
       this.front.invert();
     if (this.back)
       this.back.invert();
     const temp = this.front;
     this.front = this.back;
     this.back = temp;
   }
   clipPolygons(polygons) {
     if (!this.plane)
       return polygons.slice();
     let front = [];
     let back = [];
     for (let i = 0; i < polygons.length; i++) {
       this.plane.splitPolygon(polygons[i], front, back, front, back);
     }
     if (this.front)
       front = this.front.clipPolygons(front);
     if (this.back)
       back = this.back.clipPolygons(back);
     else
       back = [];
     return front.concat(back);
   }
   clipTo(bsp) {
     this.polygons = bsp.clipPolygons(this.polygons);
     if (this.front)
       this.front.clipTo(bsp);
     if (this.back)
       this.back.clipTo(bsp);
   }
   allPolygons() {
     let polygons = this.polygons.slice();
     if (this.front)
       polygons = polygons.concat(this.front.allPolygons());
     if (this.back)
       polygons = polygons.concat(this.back.allPolygons());
     return polygons;
   }
   build(polygons) {
     if (!polygons.length)
       return;
     if (!this.plane)
       this.plane = polygons[0].plane;
     const front = [];
     const back = [];
     for (let i = 0; i < polygons.length; i++) {
       this.plane.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
     }
     if (front.length) {
       if (!this.front)
         this.front = new BSPNode();
       this.front.build(front);
     }
     if (back.length) {
       if (!this.back)
         this.back = new BSPNode();
       this.back.build(back);
     }
   }
 };
 
 
 // src/CSG/components/CuttingPlane.js
 var _vector12 = new Vector3();
 var _vector22 = new Vector3();
 var CuttingPlane = class extends Plane {
   constructor(normal, constant) {
     super(normal, constant);
   }
   fromPoints(a, b, c) {
     const normal = b.subVectors(b, a).cross(_vector22.subVectors(c, a)).normalize();
     this.normal = normal;
     this.constant = normal.dot(a);
     return this;
   }
   setFromCoplanarPoints(a, b, c) {
     var normal = _vector12.subVectors(c, b).cross(_vector22.subVectors(a, b)).normalize();
     this.setFromNormalAndCoplanarPoint(normal, a);
     return this;
   }
   setFromNormalAndCoplanarPoint(normal, point) {
     this.normal.copy(normal);
     this.constant = -point.dot(this.normal);
     return this;
   }
   clone() {
     return new CuttingPlane().copy(this);
   }
   copy(plane) {
     this.normal.copy(plane.normal);
     this.constant = plane.constant;
     return this;
   }
   negate() {
     this.constant *= -1;
     this.normal.negate();
     return this;
   }
   splitPolygon(polygon, coplanarFront, coplanarBack, front, back) {
     const COPLANAR = 0;
     const FRONT = 1;
     const BACK = 2;
     const SPANNING = 3;
     const EPSILON = 1e-5;
     let polygonType = 0;
     const types = [];
     for (let i = 0; i < polygon.vertices.length; i++) {
       const t = this.normal.dot(polygon.vertices[i].pos) - this.constant;
       const type = t < -EPSILON ? BACK : t > EPSILON ? FRONT : COPLANAR;
       polygonType |= type;
       types.push(type);
     }
     switch (polygonType) {
       case COPLANAR:
         (this.normal.dot(polygon.plane.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
         break;
       case FRONT:
         front.push(polygon);
         break;
       case BACK:
         back.push(polygon);
         break;
       case SPANNING:
         const f = [];
         const b = [];
         for (let i = 0; i < polygon.vertices.length; i++) {
           const j = (i + 1) % polygon.vertices.length;
           const ti = types[i];
           const tj = types[j];
           const vi = polygon.vertices[i];
           const vj = polygon.vertices[j];
           if (ti != BACK)
             f.push(vi);
           if (ti != FRONT)
             b.push(ti != BACK ? vi.clone() : vi);
           if ((ti | tj) == SPANNING) {
             const t = (this.constant - this.normal.dot(vi.pos)) / this.normal.dot(vj.pos.clone().sub(vi.pos));
             const v = vi.interpolate(vj, t);
             f.push(v);
             b.push(v.clone());
           }
         }
         if (f.length >= 3) {
           const p = new Polygon(f);
           front.push(p);
         }
         if (b.length >= 3) {
           const p = new Polygon(b);
           back.push(p);
         }
         break;
     }
   }
 };
 
 // src/CSG/components/Polygon.js
 var Polygon = class {
   constructor(vertices) {
     this.vertices = vertices;
     this.plane = new CuttingPlane().fromPoints(vertices[0].pos.clone(), vertices[1].pos.clone(), vertices[2].pos.clone());
   }
   clone() {
     const vertices = this.vertices.map(function(v) {
       return v.clone();
     });
     return new Polygon(vertices);
   }
   negate() {
     this.vertices.reverse().map(function(v) {
       v.negate();
     });
     this.plane.negate();
   }
 };
 
 // src/CSG/components/Vertex.js
 var Vertex = class {
   constructor(pos, normal, uv) {
     this.pos = pos;
     if (normal)
       this.normal = normal;
     if (uv)
       this.uv = uv;
   }
   clone() {
     return new Vertex(this.pos.clone(), this.normal && this.normal.clone(), this.uv && this.uv.clone());
   }
   negate() {
     this.normal = this.normal && this.normal.negate();
   }
   interpolate(other, t) {
     let normal = null;
     if (this.normal && other.normal) {
       normal = this.normal.clone().lerp(other.normal, t);
     }
     let uv = null;
     if (this.uv && other.uv) {
       uv = this.uv.clone().lerp(other.uv, t);
     }
     return new Vertex(this.pos.clone().lerp(other.pos, t), normal, uv);
   }
 };
 
 // src/CSG/CSG.js
 var CSG = class {
   constructor() {
     this.polygons = [];
     this.material = [];
   }
   setFromGeometry(geometry) {
     //       if (!(geometry instanceof BufferGeometry)) {
     //         console.error("This library only works with three.js BufferGeometry");
     //         return;
     //       }
     if (geometry.index !== null) {
       geometry = geometry.toNonIndexed();
     }
     const positions = geometry.attributes.position;
     const normals = geometry.attributes.normal;
     const uvs = geometry.attributes.uv;
     function createVertex(index) {
       const position = new Vector3(positions.getX(index), positions.getY(index), positions.getZ(index));
       const normal = normals ? new Vector3(normals.getX(index), normals.getY(index), normals.getZ(index)) : null;
       const uv = uvs ? new Vector2(uvs.getX(index), uvs.getY(index)) : null;
       return new Vertex(position, normal, uv);
     }
     for (let i = 0; i < positions.count; i += 3) {
       const v1 = createVertex(i);
       const v2 = createVertex(i + 1);
       const v3 = createVertex(i + 2);
       this.polygons.push(new Polygon([v1, v2, v3]));
     }
     return this;
   }
   setFromMesh(mesh) {
     mesh.updateWorldMatrix();
     const transformedGeometry = mesh.geometry.clone();
     transformedGeometry.applyMatrix4(mesh.matrix);
     this.material.push(mesh.material);
     this.setFromGeometry(transformedGeometry);
     return this;
   }
   setPolygons(polygons) {
     this.polygons = polygons;
     return this;
   }
   toMesh() {
     return new Mesh(this.toGeometry(), this.material[0]);
   }
   toGeometry() {
     const geometry = new BufferGeometry();
     const positions = [];
     const normals = [];
     const uvs = [];
     const createFace = (a, b, c) => {
       positions.push(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z, c.pos.x, c.pos.y, c.pos.z);
       if (a.normal) {
         normals.push(a.normal.x, a.normal.y, a.normal.z, b.normal.x, b.normal.y, b.normal.z, c.normal.x, c.normal.y, c.normal.z);
       }
       if (a.uv) {
         uvs.push(a.uv.x, a.uv.y, b.uv.x, b.uv.y, c.uv.x, c.uv.y);
       }
     };
     for (const polygon of this.polygons) {
       for (let i = 0; i <= polygon.vertices.length - 3; i++) {
         createFace(polygon.vertices[0], polygon.vertices[i + 1], polygon.vertices[i + 2]);
       }
     }
     geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
     if (normals.length) {
       geometry.setAttribute("normal", new BufferAttribute(new Float32Array(normals), 3));
     }
     if (uvs.length) {
       geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
     }
     return geometry;
   }
   clone() {
     const csg = new CSG();
     csg.polygons = this.polygons.map(function(p) {
       return p.clone();
     });
     return csg;
   }
   union(operands) {
     for (const operand of operands) {
       if (!this.polygons.length) {
         this.setFromMesh(operand);
       } else {
         this.material.push(operand.material);
         this.unionOperand(new CSG().setFromMesh(operand));
       }
     }
     return this;
   }
   unionOperand(operand) {
     const a = new BSPNode(this.polygons);
     const b = new BSPNode(operand.polygons);
     a.clipTo(b);
     b.clipTo(a);
     b.invert();
     b.clipTo(a);
     b.invert();
     a.build(b.allPolygons());
     this.polygons = a.allPolygons();
     return this;
   }
   subtract(operands) {
     for (const operand of operands) {
       if (!this.polygons.length) {
         this.setFromMesh(operand);
       } else {
         this.material.push(operand.material);
         this.subtractOperand(new CSG().setFromMesh(operand));
       }
     }
     return this;
   }
   subtractOperand(operand) {
     this.complement().unionOperand(operand).complement();
   }
   intersect(operands) {
     for (const operand of operands) {
       if (!this.polygons.length) {
         this.setFromMesh(operand);
       } else {
         this.material.push(operand.material);
         this.intersectOperand(new CSG().setFromMesh(operand));
       }
     }
     return this;
   }
   intersectOperand(operand) {
     const a = new BSPNode(this.polygons);
     const b = new BSPNode(operand.polygons);
     const d = new BSPNode(this.clone().polygons);
     const c = new BSPNode(operand.clone().polygons);
     a.invert();
     b.clipTo(a);
     b.invert();
     a.clipTo(b);
     b.clipTo(a);
     a.build(b.allPolygons());
     a.invert();
     c.invert();
     d.clipTo(c);
     d.invert();
     c.clipTo(d);
     d.clipTo(c);
     c.build(d.allPolygons());
     c.invert();
     this.polygons = c.allPolygons().concat(a.allPolygons());
   }
   complement() {
     this.polygons.map((p) => {
       p.negate();
     });
     return this;
   }
 };
 
 export { CSG };
 
