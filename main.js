import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshStandardMaterial,
    Mesh,
    DirectionalLight,
    InstancedBufferGeometry,
    BufferAttribute,
    RawShaderMaterial,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TreeMaterial } from './TreeMaterial.js';
import { TreeGeometryBuilder } from './TreeGeometryBuilder.js';

const scene = new Scene();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new WebGLRenderer({
    antialias: true,
});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.5;

const geometry = new BoxGeometry( 1, 1, 1 );
const material = new MeshStandardMaterial( { color: 0x00ff00 } );
const cube = new Mesh( geometry, material );
cube.position.set( 3, 0, 0 );
//scene.add( cube );

const builder = new TreeGeometryBuilder();
const treeGeo = builder.createGeometry();
treeGeo.instanceCount = 10;
const treeMat = new TreeMaterial();
treeMat.vertexColors = true;
const mesh = new Mesh( treeGeo, treeMat );
mesh.position.set( -14, 0, 0 )
scene.add( mesh );


const s = 4.0;
camera.position.set( -1 * s, 2 * s, 5 * s );
controls.update();

const keyLight = new DirectionalLight( 0xffffff, 1.5 );
keyLight.position.set( -1, 3, 0 );
scene.add( keyLight );
const rimLight = new DirectionalLight( 0xffffff, 0.5 );
rimLight.position.set( 1, 0, -4 );
scene.add( rimLight );
const fillLight = new DirectionalLight( 0xffffff, 0.3 );
fillLight.position.set( 0, -1, 5 );
scene.add( fillLight );

function animate() {
    const time = performance.now();
	requestAnimationFrame( animate );
    treeMat.uniforms.time.value = time * 0.005;
    controls.update();
	renderer.render( scene, camera );
}
animate();
