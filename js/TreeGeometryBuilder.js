import {
    InstancedBufferGeometry,
    BufferAttribute,
    Uint32BufferAttribute,
    Vector3,
    Box3,
} from 'three';

const MAX_FLOOR_COUNT = 10;

export class TreeGeometryBuilder {
    constructor(params) {
        this.params = {
            sideCount: 6,
            floorCount: MAX_FLOOR_COUNT,
            ...params
        };
    }

    getCountsPerFloor(sideCount) {
        const quads = sideCount; // sides
        const tris = 2 * sideCount; // top, down
        const corners = 6 * quads + 3 * tris;
        return { corners };
    }

    getCounts() {
        const {
            sideCount,
            floorCount,
        } = this.params;
        const floorCounts = this.getCountsPerFloor(sideCount);
        return {
            corners: floorCounts.corners * floorCount,
        };
    }

    // A floor is simply a cylinder
    fillFloorAttributes(sideCount, buffers, context) {

        let c = context.offset;

        // Sides
        for (let i = 0 ; i < sideCount ; ++i) {
            const angleBegin = 2 * Math.PI * i / sideCount;
            const angleEnd = 2 * Math.PI * (i + 1) / sideCount;
            const angleHalf = 2 * Math.PI * (i + 0.5) / sideCount;
            const cosHalf = Math.cos(angleHalf);
            const sinHalf = Math.sin(angleHalf);
            for (let k = 0 ; k < 6 ; ++k) {
                const j = [0, 2, 1, 1, 2, 3][k];
                const height = j < 2 ? 0.0 : 1.0;
                const angle = j % 2 == 0 ? angleBegin : angleEnd
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                buffers.position.set([cos, height, sin], 3 * c);
                buffers.normal.set([cosHalf, 0, sinHalf], 3 * c);
                ++c;
            }
        }

        // Top
        for (let i = 0 ; i < sideCount ; ++i) {
            const angleBegin = 2 * Math.PI * i / sideCount;
            const angleEnd = 2 * Math.PI * (i + 1) / sideCount;
            for (let j = 0 ; j < 3 ; ++j) {
                const radius = j < 2 ? 1.0 : 0.0;
                const angle = j % 2 == 0 ? angleEnd : angleBegin
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                buffers.position.set([radius * cos, 1.0, radius * sin], 3 * c);
                buffers.normal.set([0, 1, 0], 3 * c);
                ++c;
            }
        }

        // Bottom
        for (let i = 0 ; i < sideCount ; ++i) {
            const angleBegin = 2 * Math.PI * i / sideCount;
            const angleEnd = 2 * Math.PI * (i + 1) / sideCount;
            for (let j = 0 ; j < 3 ; ++j) {
                const radius = j < 2 ? 1.0 : 0.0;
                const angle = j % 2 == 0 ? angleBegin : angleEnd
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                buffers.position.set([radius * cos, 0.0, radius * sin], 3 * c);
                buffers.normal.set([0, -1, 0], 3 * c);
                ++c;
            }
        }

        console.assert(c - context.offset == this.getCountsPerFloor(sideCount).corners);
        return {
            offset: c,
        };
    }

    fillAttributes(buffers) {
        const {
            floorCount,
            sideCount,
        } = this.params;
        let ctx = {
            offset: 0,
        };
        let floorIndex = 0;
        for (let i = 0 ; i < floorCount ; ++i) {
            const prevOffset = ctx.offset;
            ctx = this.fillFloorAttributes(sideCount, buffers, ctx);
            buffers.floorIndex.fill(floorIndex, prevOffset, ctx.offset);
            ++floorIndex;
        }
        console.assert(ctx.offset == this.getCounts().corners);
    }

    createBuffers() {
        const counts = this.getCounts();
        const vertexData = {
            position: new Float32Array(3 * counts.corners),
            normal: new Float32Array(3 * counts.corners),
            floorIndex: new Uint32Array(counts.corners),
        };
        return vertexData;
    }

    createGeometry() {
        const vertexData = this.createBuffers();
        this.fillAttributes(vertexData);

        const geometry = new InstancedBufferGeometry();
        geometry.setAttribute( 'position', new BufferAttribute( vertexData.position, 3 ) );
        geometry.setAttribute( 'normal', new BufferAttribute( vertexData.normal, 3 ) );
        geometry.setAttribute( 'floorIndex', new Uint32BufferAttribute( vertexData.floorIndex, 1 ) );
        return geometry;
    }

    /**
     * Compute box and sphere bounds of treeGeo, given a list of instance positions.
     * @param {InstancedBufferGeometry} treeGeo 
     * @param {Float32Array} treePositions 
     */
    computeBounds(treeGeo, treePositions) {
        console.assert(treePositions.length == 3 * treeGeo.instanceCount);

        // Box
        treeGeo.computeBoundingBox();
        const instancePositionBBox = new Box3();
        const point = new Vector3();
        for (let i = 0 ; i < treeGeo.instanceCount ; ++i) {
            point.set(
                treePositions[3 * i + 0],
                treePositions[3 * i + 1],
                treePositions[3 * i + 2],
            );
            if (i == 0) {
                instancePositionBBox.min.copy( point );
                instancePositionBBox.max.copy( point );
            } else {
                instancePositionBBox.expandByPoint( point );
            }
        }
        treeGeo.boundingBox.min.sub( instancePositionBBox.min );
        treeGeo.boundingBox.max.add( instancePositionBBox.max );

        // Sphere
        treeGeo.computeBoundingSphere();
        const baseRadius = treeGeo.boundingSphere.radius;
        instancePositionBBox.getBoundingSphere(treeGeo.boundingSphere);
        treeGeo.boundingSphere.radius += baseRadius;
    }
}
