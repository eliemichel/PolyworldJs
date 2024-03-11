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

    constructor(opts) {
        super(opts);

        this.onBeforeCompile = (shader) => {
            // Patching from https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshphysical.glsl.js
            for (const [key, entry] of Object.entries(this.uniforms)) {
                shader.uniforms[key] = entry;
            }

            const injectAfterCommon = document.getElementById('injectAfterCommon').textContent;
            const injectAfterBeginVertex = document.getElementById('injectAfterBeginVertex').textContent;
            const injectAfterColorVertex = document.getElementById('injectAfterColorVertex').textContent;

            shader.vertexShader = shader.vertexShader
                .replace(
                    `#include <common>`,
                    `#include <common>
                    ${injectAfterCommon}
                    `
                )
                .replace(
                    `#include <color_vertex>`,
                    `#include <color_vertex>
                    ${injectAfterColorVertex}
                    `
                )
                .replace(
                    `#include <begin_vertex>`,
                    `#include <begin_vertex>
                    ${injectAfterBeginVertex}
                    `
                );

            shader.fragmentShader = shader.fragmentShader
            .replace('', '');
        };
    }
}
