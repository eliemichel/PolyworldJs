import { mulberry32 } from './random.js';

export function createTreePositions(ringCount, spacing, randomness, seed) {
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
    const positions = new Float32Array(3 * count);
    countAndFill(positions);
    return positions;
}
