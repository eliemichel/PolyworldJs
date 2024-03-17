import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshStandardMaterial,
    Mesh,
    DirectionalLight,
    InstancedBufferAttribute,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TreeMaterial } from './TreeMaterial.js';
import { TreeGeometryBuilder } from './TreeGeometryBuilder.js';
import { mulberry32 } from './random.js';

const scene = new Scene();

// Renderer
const renderer = new WebGLRenderer({
    antialias: true,
});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Camera controls
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.5;

const s = 4.0;
camera.position.set( -1 * s, 2 * s, 5 * s );
controls.update();

// Box
const geometry = new BoxGeometry( 1, 1, 1 );
const material = new MeshStandardMaterial( { color: 0x00ff00 } );
const cube = new Mesh( geometry, material );
cube.position.set( 3, 0, 0 );
//scene.add( cube );

// Tree
function createTreePositions(ringCount, spacing, randomness, seed) {
    seed = seed || Math.random() * 4294967296;

    function countAndFill(data) {
        const prng = mulberry32(seed);
        const radius = spacing / 2;
        let count = 0
        for (let q = -ringCount+1 ; q < ringCount ; ++q) {
            for (let r = -ringCount+1 ; r < ringCount ; ++r) {
                const s = -q - r;
                if (Math.abs(s) >= ringCount) continue;

                const noiseX = (prng()  * 2.0 - 1.0) * radius * randomness;
                const noiseZ = (prng()  * 2.0 - 1.0) * radius * randomness;

                if (data) data.set( [
                    (q + r / 2) * radius * Math.sqrt(3) + noiseX,
                    0,
                    -r * radius * 3 / 2 + noiseZ
                ], 3 * count );
                count += 1;
            }
        }
        return count;
    }

    const count = countAndFill();
    const positions = new Float32Array(count * 3);
    countAndFill(positions);
    return positions;
}
const builder = new TreeGeometryBuilder();
const treeGeo = builder.createGeometry();
const treePositions = createTreePositions(5, 2.5, 0.4);
treeGeo.instanceCount = (treePositions.length / 3) | 0;
treeGeo.setAttribute( 'instancePosition', new InstancedBufferAttribute( treePositions, 3 ) );
builder.computeBounds(treeGeo, treePositions);
const treeMat = new TreeMaterial();
treeMat.vertexColors = true;
const mesh = new Mesh( treeGeo, treeMat );
scene.add( mesh );

// Lights
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
    treeMat.uniforms.time.value = time * 0.005;
    treeMat.uniforms.instanceCount.value = treeGeo.instanceCount;
    controls.update();
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}
animate();
