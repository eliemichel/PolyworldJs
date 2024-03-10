import {
    RawShaderMaterial,
    MeshStandardMaterial,
} from 'three';

/*
export class TreeMaterial extends RawShaderMaterial {
    constructor() {
        super( {
            uniforms: {
                time: { value: 1.0 }
            },
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
        } );

        this.onBeforeCompile = (shader) => {
            shader.vertexShader = shader.vertexShader
            .replace('', '');

            shader.fragmentShader = shader.fragmentShader
            .replace('', '');
        };
    }
}
*/

export class TreeMaterial extends MeshStandardMaterial {
    uniforms = {
        time: { value: 0.0 },
    };

    constructor() {
        super( { color: 0xff8800 } );

        this.onBeforeCompile = (shader) => {
            // Patching from https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshphysical.glsl.js
            for (const [key, entry] of Object.entries(this.uniforms)) {
                shader.uniforms[key] = entry;
            }

            shader.vertexShader = shader.vertexShader
                .replace(
                    `#include <common>`,
                    `#include <common>
                    uniform float time;
                    `
                )
                .replace(
                    `#include <begin_vertex>`,
                    `#include <begin_vertex>
                    transformed.x += sin(time) * transformed.y + float(gl_InstanceID) * 3.0;
                    `
                );

            shader.fragmentShader = shader.fragmentShader
            .replace('', '');
        };
    }
}
