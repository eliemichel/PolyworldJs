import {
    MeshStandardMaterial,
    UniformsGroup,
    Uniform,
    Vector3,
} from 'three';

// Must match the size of TreeFamilyConfig::presets in the shaders
const MAX_PRESET_COUNT = 2;

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
    };
    uniformsGroups = [];

    constructor(opts) {
        super(opts);

        const floors = [
            (() => {
                const floorConfig = new UniformsGroup();
                floorConfig.setName("TreeFloorConfig");
                floorConfig.add( new Uniform( new Vector3(1.0, 0.0, 0.5) ) ); // color
                floorConfig.add( new Uniform(  ) ); // height
                floorConfig.add( new Uniform(  ) ); // bottomRadius
                floorConfig.add( new Uniform(  ) ); // topRadius
                floorConfig.add( new Uniform(  ) ); // offset
                return floorConfig;
            })(),
        ];

        const presets = [
            (() => {
                const treeConfig = new UniformsGroup();
                treeConfig.setName("TreeConfig");
                treeConfig.add( new Uniform( floors ) );
                return treeConfig;
            })(),
        ];

        const treeFamilyConfig = new UniformsGroup();
        treeFamilyConfig.setName( "TreeFamilyConfig" );
        treeFamilyConfig.add( new Uniform( presets ) );
        treeFamilyConfig.add( new Uniform( 1 ) ); // presetCount

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
                        height: 4.0,
                        crownRandomness: 0.1,
                        crownBaseRadius: 1.0,
                        crownShrinkFactor: 0.3,
                        trunkHeight: 2.0,
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
