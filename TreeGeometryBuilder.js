export class TreeGeometryBuilder {
    constructor(params) {
        this.params = {
            floors: [
                {
                    sideCount: 6,
                    height: 1,
                    bottomRadius: 0.4,
                    topRadius: 0.3,
                },
                {
                    sideCount: 6,
                    height: 0.8,
                    bottomRadius: 1.0,
                    topRadius: 0.5,
                },
                {
                    sideCount: 6,
                    height: 0.7,
                    bottomRadius: 0.8,
                    topRadius: 0.3,
                },
                {
                    sideCount: 6,
                    height: 0.6,
                    bottomRadius: 0.5,
                    topRadius: 0.05,
                },
            ],
            ...params
        };
    }

    getFloorCounts(floor) {
        const {
            sideCount,
        } = floor;
        const quads = sideCount; // sides
        const tris = 2 * sideCount; // top, down
        const corners = 6 * quads + 3 * tris;
        return { corners };
    }

    getCounts() {
        const {
            floors,
        } = this.params;
        const counts = {
            corners: 0,
        };
        for (const f of floors) {
            const floorCounts = this.getFloorCounts(f);
            counts.corners += floorCounts.corners;
        }
        return counts;
    }

    fillFloorAttributes(floor, buffers, context) {
        const {
            sideCount,
            height,
            bottomRadius,
            topRadius,
        } = floor;

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
                const radius = j < 2 ? bottomRadius : topRadius;
                const y = context.heightOffset + (j < 2 ? 0 : height);
                const angle = j % 2 == 0 ? angleBegin : angleEnd
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                buffers.position.set([radius * cos, y, radius * sin], 3 * c);
                buffers.normal.set([cosHalf, 0, sinHalf], 3 * c);
                ++c;
            }
        }

        // Top
        for (let i = 0 ; i < sideCount ; ++i) {
            const angleBegin = 2 * Math.PI * i / sideCount;
            const angleEnd = 2 * Math.PI * (i + 1) / sideCount;
            for (let j = 0 ; j < 3 ; ++j) {
                const radius = j < 2 ? topRadius : 0;
                const y = context.heightOffset + height;
                const angle = j % 2 == 0 ? angleEnd : angleBegin
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                buffers.position.set([radius * cos, y, radius * sin], 3 * c);
                buffers.normal.set([0, 1, 0], 3 * c);
                ++c;
            }
        }

        // Bottom
        for (let i = 0 ; i < sideCount ; ++i) {
            const angleBegin = 2 * Math.PI * i / sideCount;
            const angleEnd = 2 * Math.PI * (i + 1) / sideCount;
            for (let j = 0 ; j < 3 ; ++j) {
                const radius = j < 2 ? bottomRadius : 0;
                const y = context.heightOffset;
                const angle = j % 2 == 0 ? angleBegin : angleEnd
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                buffers.position.set([radius * cos, y, radius * sin], 3 * c);
                buffers.normal.set([0, -1, 0], 3 * c);
                ++c;
            }
        }

        console.assert(c - context.offset == this.getFloorCounts(floor).corners);
        return {
            offset: c,
            heightOffset: context.heightOffset + height,
        };
    }

    fillAttributes(buffers) {
        const {
            floors,
        } = this.params;
        let ctx = {
            offset: 0,
            heightOffset: 0,
        };
        for (const f of floors) {
            ctx = this.fillFloorAttributes(f, buffers, ctx);
        }
        console.assert(ctx.offset == this.getCounts().corners);
    }
}
