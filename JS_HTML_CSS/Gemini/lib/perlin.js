// A simplified Perlin Noise implementation (from StackOverflow, modified)
function PerlinNoise() {
    this.grad3 = [[-1,-1,1],[1,-1,1],[-1,1,1],[1,1,1],[-1,-1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1],[0,-1,0],[0,1,0],[-1,0,0],[1,0,0],[0,0,-1],[0,0,1]];
    this.p = [];

    this.seed = function(seed) {
        // Simple seeded random number generator
        let r = new SeededRandom(seed);
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(r.next() * 256);
        }
        // Duplicate array to eliminate bounds checking
        this.p = this.p.concat(this.p);
    };

    this.fade = function(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    };

    this.lerp = function(t, a, b) {
        return a + t * (b - a);
    };

    this.grad = function(hash, x, y, z) {
        let h = hash & 15;      // CONVERT LO 4 BITS OF HASH CODE
        let u = h<8 ? x : y;
        let v = h<4 ? y : h==12||h==14 ? x : z;
        return ((h&1) === 0 ? u : -u) + ((h&2) === 0 ? v : -v);
    };

    this.noise = function(x, y, z) {
        let X = Math.floor(x) & 255;
        let Y = Math.floor(y) & 255;
        let Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        let u = this.fade(x);
        let v = this.fade(y);
        let w = this.fade(z);

        let A = this.p[X] + Y, AA = this.p[A] + Z, AB = this.p[A + 1] + Z;
        let B = this.p[X + 1] + Y, BA = this.p[B] + Z, BB = this.p[B + 1] + Z;

        return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z),
                                                this.grad(this.p[BA], x - 1, y, z)),
                                        this.lerp(u, this.grad(this.p[AB], x, y - 1, z),
                                                this.grad(this.p[BB], x - 1, y - 1, z))),
                        this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1),
                                                this.grad(this.p[BA + 1], x - 1, y, z - 1)),
                                        this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1),
                                                this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
    };
}

// Seeded Random Number Generator
function SeededRandom(seed) {
    this.seed = seed;
    this.next = function() {
        let x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    };
}