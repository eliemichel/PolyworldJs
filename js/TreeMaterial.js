import {
    MeshStandardMaterial,
    Vector3,
} from 'three';

// Must match the size of TreeFamilyConfig::presets in the shaders
const MAX_PRESET_COUNT = 3;

function createTreeConfig() {
    return {
        crownFloorCount: 0,
        height: 0.0,
        crownRandomness: 0.0,
        crownBaseRadius: 0.0,
        crownShrinkFactor: 0.0,
        trunkHeight: 0.0,
        trunkRadius: 0.0,
        trunkRadiusRandomness: 0.0,
        trunkColor: new Vector3(0.0, 0.0, 0.0),
        crownColors: [
            new Vector3(0.0, 0.0, 0.0),
            new Vector3(0.0, 0.0, 0.0),
            new Vector3(0.0, 0.0, 0.0),
            new Vector3(0.0, 0.0, 0.0),
        ],
        bend: new Vector3(0.0, 0.0, 0.0),
        overshoot: 0.0,
    }
}

export class TreeMaterial extends MeshStandardMaterial {
    uniforms = {
        time: { value: 0.0 },
        instanceCount: { value: 10 },
        windAmplitude: { value: 0.1 },
        windDirectionAngle: { value: 0.1 },
        windInverseSpeed: { value: 0.1 },
        windTurbulence: { value: 0.5 },
    };
    uniformsGroups = [];

    constructor(opts) {
        super(opts);

        this.uniforms.treeFamilyConfig = {
            value: {
                presets: [
                    {
                        crownFloorCount: 8,
                        height: 5.0,
                        crownRandomness: 0.1,
                        crownBaseRadius: 1.0,
                        crownShrinkFactor: 0.6,
                        trunkHeight: 1.0,
                        trunkRadius: 0.35,
                        trunkRadiusRandomness: 0.0,
                        trunkColor: new Vector3(1.0, 0.5, 0.0),
                        crownColors: [
                            new Vector3(0.0, 0.6, 0.8),
                            new Vector3(0.2, 0.8, 0.9),
                            new Vector3(0.6, 0.9, 1.0),
                            new Vector3(0.6, 0.9, 1.0),
                        ],
                        bend: new Vector3(0.0, 0.0, 0.0),
                        overshoot: 1.1,
                    },
                    {
                        crownFloorCount: 4,
                        height: 6.0,
                        crownRandomness: 0.1,
                        crownBaseRadius: 1.5,
                        crownShrinkFactor: 0.3,
                        trunkHeight: 4.0,
                        trunkRadius: 0.125,
                        trunkRadiusRandomness: 0.0,
                        trunkColor: new Vector3(1.0, 0.5, 0.0),
                        crownColors: [
                            new Vector3(0.0, 0.6, 0.8),
                            new Vector3(0.2, 0.8, 0.9),
                            new Vector3(0.6, 0.9, 1.0),
                            new Vector3(0.6, 0.9, 1.0),
                        ],
                        bend: new Vector3(0.2, 0.0, 0.0),
                        overshoot: 1.1,
                    },
                    {
                        crownFloorCount: 9,
                        height: 8.0,
                        crownRandomness: 0.1,
                        crownBaseRadius: 1.5,
                        crownShrinkFactor: 0.3,
                        trunkHeight: 2.0,
                        trunkRadius: 0.3,
                        trunkRadiusRandomness: 0.1,
                        trunkColor: new Vector3(1.0, 0.5, 0.0),
                        crownColors: [
                            new Vector3(0.0, 0.6, 0.8),
                            new Vector3(0.2, 0.8, 0.9),
                            new Vector3(0.6, 0.9, 1.0),
                            new Vector3(0.6, 0.9, 1.0),
                        ],
                        bend: new Vector3(0.0, 0.0, 0.0),
                        overshoot: 1.1,
                    }
                ],
                presetCount: 2,
            }
        };

        while (this.uniforms.treeFamilyConfig.value.presets.length < MAX_PRESET_COUNT) {
            this.uniforms.treeFamilyConfig.value.presets.push(createTreeConfig());
        }

        this.onBeforeCompile = (shader) => {
            // Patching from https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshphysical.glsl.js
            for (const [key, entry] of Object.entries(this.uniforms)) {
                shader.uniforms[key] = entry;
            }

            const injectAfterCommon = document.getElementById('injectAfterCommon').textContent;
            const injectAfterBeginVertex = document.getElementById('injectAfterBeginVertex').textContent;
            const injectAfterColorVertex = document.getElementById('injectAfterColorVertex').textContent;
            const injectAfterBeginNormal = document.getElementById('injectAfterBeginNormal').textContent;

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
                )
                .replace(
                    `#include <beginnormal_vertex>`,
                    `#include <beginnormal_vertex>
                    ${injectAfterBeginNormal}
                    `
                );

            shader.fragmentShader = shader.fragmentShader
            .replace('', '');
        };
    }
}
