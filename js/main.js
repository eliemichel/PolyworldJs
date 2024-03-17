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
import GUI from 'lil-gui';

import { TreeMaterial } from './TreeMaterial.js';
import { TreeGeometryBuilder } from './TreeGeometryBuilder.js';
import { createTreePositions } from './forest.js';

const state = {
    forest: {
        ringCount: 10,
    },

    wind: {
        amplitude: 0.2,
        direction: 60,
        speed: 20.0,
        turbulence: 0.4,
    },

    graphics: {
        treeGeo: null,
        treeMesh: null,
    },
};

function initGui() {
    const gui = new GUI();

    const forestFolder = gui.addFolder("Forest");
    forestFolder.add(state.forest, "ringCount", 1, 50, 1).onChange(updateInstancePositions);

    const windFolder = gui.addFolder("Wind");
    windFolder.add(state.wind, "amplitude", 0.0, 1.0);
    windFolder.add(state.wind, "direction", -180, 180);
    windFolder.add(state.wind, "speed", 0.0, 100.0);
    windFolder.add(state.wind, "turbulence", 0.0, 1.0);
}

function updateInstancePositions() {
    const treePositions = createTreePositions(state.forest.ringCount, 2.5, 0.4);

    {
        const { treeGeo } = state.graphics;
        treeGeo.instanceCount = (treePositions.length / 3) | 0;
        if (treeGeo._maxInstanceCount !== undefined && treeGeo._maxInstanceCount < treeGeo.instanceCount) {
            rebuildTreeGeometry();
        }
    }

    {
        const { treeGeo } = state.graphics;
        treeGeo.instanceCount = (treePositions.length / 3) | 0;
        console.log("Tree count: ", treeGeo.instanceCount);
        treeGeo.setAttribute( 'instancePosition', new InstancedBufferAttribute( treePositions, 3 ) );

        new TreeGeometryBuilder().computeBounds(treeGeo, treePositions);
    }
}

function rebuildTreeGeometry() {
    const { graphics } = state;
    if (graphics.treeGeo) {
        graphics.treeGeo.dispose();
    }
    graphics.treeGeo = new TreeGeometryBuilder().createGeometry();
    
    graphics.treeMesh.geometry = graphics.treeGeo;
}

function main() {
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

    const s = 5.0;
    camera.position.set( -1 * s, 6 * s, 4 * s );
    controls.update();

    // Box
    const geometry = new BoxGeometry( 1, 1, 1 );
    const material = new MeshStandardMaterial( { color: 0x00ff00 } );
    const cube = new Mesh( geometry, material );
    cube.position.set( 3, 0, 0 );
    //scene.add( cube );

    // Tree
    state.graphics.treeGeo = new TreeGeometryBuilder().createGeometry();
    updateInstancePositions();
    const treeMat = new TreeMaterial();
    treeMat.vertexColors = true;
    state.graphics.treeMesh = new Mesh( state.graphics.treeGeo, treeMat );
    scene.add( state.graphics.treeMesh );

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
        treeMat.uniforms.instanceCount.value = state.graphics.treeGeo.instanceCount;
        treeMat.uniforms.windAmplitude.value = state.wind.amplitude;
        treeMat.uniforms.windDirectionAngle.value = state.wind.direction * Math.PI / 180;
        treeMat.uniforms.windInverseSpeed.value = 1.0 / (0.001 + state.wind.speed);
        treeMat.uniforms.windTurbulence.value = state.wind.turbulence;
        controls.update();
        renderer.render( scene, camera );
        requestAnimationFrame( animate );
    }
    animate();

    initGui();
}

main();
