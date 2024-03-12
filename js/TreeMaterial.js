import {
    MeshStandardMaterial,
    UniformsGroup,
    Uniform,
    Vector3,
} from 'three';

export class TreeMaterial extends MeshStandardMaterial {
    uniforms = {
        time: { value: 0.0 },
        noiseLevel: { value: 0.1 },
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
                        floors: [
                            {
                                color: new Vector3(1.0, 0.5, 0.0),
                                height: 1.0,
                                bottomRadius: 0.4,
                                topRadius: 0.3,
                            },
                            {
                                color: new Vector3(0.0, 0.6, 0.8),
                                height: 0.8 * 1.5,
                                bottomRadius: 1.0,
                                topRadius: 0.5,
                            },
                            {
                                color: new Vector3(0.2, 0.8, 0.9),
                                height: 0.7 * 1.5,
                                bottomRadius: 0.8,
                                topRadius: 0.3,
                            },
                            {
                                color: new Vector3(0.6, 0.9, 1.0),
                                height: 0.6 * 1.5,
                                bottomRadius: 0.5,
                                topRadius: 0.05,
                            },
                        ]
                    },
                    {
                        floors: [
                            {
                                color: new Vector3(1.0, 0.5, 0.0),
                                height: 2.0,
                                bottomRadius: 0.15,
                                topRadius: 0.1,
                            },
                            {
                                color: new Vector3(0.0, 0.6, 0.8),
                                height: 0.8,
                                bottomRadius: 1.0,
                                topRadius: 0.5,
                            },
                            {
                                color: new Vector3(0.2, 0.8, 0.9),
                                height: 0.7,
                                bottomRadius: 0.8,
                                topRadius: 0.3,
                            },
                            {
                                color: new Vector3(0.6, 0.9, 1.0),
                                height: 0.6,
                                bottomRadius: 0.5,
                                topRadius: 0.05,
                            },
                        ]
                    }
                ],
                presetCount: 1,
            }
        };

        for (const preset of this.uniforms.treeFamilyConfig.value.presets) {
            let offset = 0;
            for (const fl of preset.floors) {
                fl.offset = offset;
                offset += fl.height - this.uniforms.noiseLevel.value;
            }
        }

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
