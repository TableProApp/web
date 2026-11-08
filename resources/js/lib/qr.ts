// A QR code in byte mode at error correction level M, versions 1 to 6 (up to 106 bytes): enough for a store link, drawn
// on the server with no third-party host. Pure, with no imports, so `node --test` loads it (tests/js/qr.test.ts).

// Per version: error correction codewords per block, blocks, data codewords per block. Level M has equal blocks up to 6.
const LEVEL_M: ReadonlyArray<readonly [number, number, number]> = [
    [10, 1, 16],
    [16, 1, 28],
    [26, 1, 44],
    [18, 2, 32],
    [24, 2, 43],
    [16, 4, 27],
];

const ALIGNMENT: ReadonlyArray<readonly number[]> = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34]];

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

for (let i = 0, x = 1; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;

    if (x & 0x100) {
        x ^= 0x11d;
    }
}

for (let i = 255; i < 512; i++) {
    EXP[i] = EXP[i - 255];
}

function multiply(a: number, b: number): number {
    return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
}

function errorCorrection(data: number[], degree: number): number[] {
    let generator = [1];

    for (let i = 0; i < degree; i++) {
        const next = new Array<number>(generator.length + 1).fill(0);

        generator.forEach((coefficient, j) => {
            next[j] ^= coefficient;
            next[j + 1] ^= multiply(coefficient, EXP[i]);
        });
        generator = next;
    }

    const remainder = new Array<number>(degree).fill(0);

    for (const byte of data) {
        const factor = byte ^ (remainder.shift() ?? 0);
        remainder.push(0);

        for (let j = 0; j < degree; j++) {
            remainder[j] ^= multiply(generator[j + 1], factor);
        }
    }

    return remainder;
}

function codewords(text: string): { version: number; words: number[] } {
    const bytes = [...new TextEncoder().encode(text)];
    const index = LEVEL_M.findIndex(([, blocks, data]) => blocks * data * 8 >= 12 + bytes.length * 8);

    if (index === -1) {
        throw new RangeError(`A QR code here holds at most 106 bytes; got ${bytes.length}.`);
    }

    const [degree, blocks, perBlock] = LEVEL_M[index];
    const capacity = blocks * perBlock * 8;
    const bits: number[] = [];
    const push = (value: number, length: number): void => {
        for (let i = length - 1; i >= 0; i--) {
            bits.push((value >>> i) & 1);
        }
    };

    push(0b0100, 4);
    push(bytes.length, 8);
    bytes.forEach((byte) => push(byte, 8));
    push(0, Math.min(4, capacity - bits.length));
    push(0, (8 - (bits.length % 8)) % 8);

    const data: number[] = [];

    for (let i = 0; i < bits.length; i += 8) {
        data.push(bits.slice(i, i + 8).reduce((byte, bit) => (byte << 1) | bit, 0));
    }

    for (let pad = 0xec; data.length < blocks * perBlock; pad ^= 0xec ^ 0x11) {
        data.push(pad);
    }

    const split = Array.from({ length: blocks }, (_, block) => data.slice(block * perBlock, (block + 1) * perBlock));
    const corrections = split.map((block) => errorCorrection(block, degree));
    const words: number[] = [];

    for (let i = 0; i < perBlock; i++) {
        split.forEach((block) => words.push(block[i]));
    }

    for (let i = 0; i < degree; i++) {
        corrections.forEach((block) => words.push(block[i]));
    }

    return { version: index + 1, words };
}

const MASKS: ReadonlyArray<(x: number, y: number) => boolean> = [
    (x, y) => (x + y) % 2 === 0,
    (_, y) => y % 2 === 0,
    (x) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

function penalty(modules: boolean[][]): number {
    const size = modules.length;
    let score = 0;
    let dark = 0;

    for (const lines of [modules, modules.map((_, x) => modules.map((row) => row[x]))]) {
        for (const line of lines) {
            let run = 1;

            for (let i = 1; i <= size; i++) {
                if (i < size && line[i] === line[i - 1]) {
                    run++;
                    continue;
                }

                score += run >= 5 ? run - 2 : 0;
                run = 1;
            }

            const text = line.map((module) => (module ? '1' : '0')).join('');

            for (const pattern of ['10111010000', '00001011101']) {
                for (let at = text.indexOf(pattern); at !== -1; at = text.indexOf(pattern, at + 1)) {
                    score += 40;
                }
            }
        }
    }

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            dark += modules[y][x] ? 1 : 0;

            if (x < size - 1 && y < size - 1) {
                const color = modules[y][x];

                score += color === modules[y][x + 1] && color === modules[y + 1][x] && color === modules[y + 1][x + 1] ? 3 : 0;
            }
        }
    }

    return score + Math.floor(Math.abs((dark * 100) / (size * size) - 50) / 5) * 10;
}

// The two cells of format bit i, the least significant first: beside the top-left finder, then split between the
// other two.
function formatCells(size: number): Array<[[number, number], [number, number]]> {
    return Array.from({ length: 15 }, (_, i): [[number, number], [number, number]] => [
        i <= 5 ? [8, i] : i === 6 ? [8, 7] : i === 7 ? [8, 8] : i === 8 ? [7, 8] : [14 - i, 8],
        i < 8 ? [size - 1 - i, 8] : [8, size - 15 + i],
    ]);
}

// Level M's two format bits are 00, so the mask number is the whole five-bit value.
function formatBits(mask: number): number {
    let remainder = mask;

    for (let i = 0; i < 10; i++) {
        remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537);
    }

    return ((mask << 10) | remainder) ^ 0x5412;
}

// Rows of modules, true for dark, without the quiet zone.
export function qrMatrix(text: string): boolean[][] {
    const { version, words } = codewords(text);
    const size = 17 + version * 4;
    const modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
    const reserved = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
    const set = (x: number, y: number, dark: boolean): void => {
        modules[y][x] = dark;
        reserved[y][x] = true;
    };

    for (let i = 0; i < size; i++) {
        set(6, i, i % 2 === 0);
        set(i, 6, i % 2 === 0);
    }

    for (const [cx, cy] of [
        [3, 3],
        [size - 4, 3],
        [3, size - 4],
    ]) {
        for (let dy = -4; dy <= 4; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
                const x = cx + dx;
                const y = cy + dy;
                const distance = Math.max(Math.abs(dx), Math.abs(dy));

                if (x >= 0 && x < size && y >= 0 && y < size) {
                    set(x, y, distance !== 2 && distance !== 4);
                }
            }
        }
    }

    const centres = ALIGNMENT[version - 1];
    const last = centres.length - 1;

    centres.forEach((cy, row) =>
        centres.forEach((cx, column) => {
            if ((row === 0 && (column === 0 || column === last)) || (row === last && column === 0)) {
                return;
            }

            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
                }
            }
        }),
    );

    const cells = formatCells(size);

    cells.flat().forEach(([x, y]) => set(x, y, false));
    set(8, size - 8, true);

    let bit = 0;

    for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) {
            right = 5;
        }

        for (let vertical = 0; vertical < size; vertical++) {
            for (let j = 0; j < 2; j++) {
                const x = right - j;
                const y = ((right + 1) & 2) === 0 ? size - 1 - vertical : vertical;

                if (!reserved[y][x] && bit < words.length * 8) {
                    modules[y][x] = ((words[bit >>> 3] >>> (7 - (bit & 7))) & 1) === 1;
                    bit++;
                }
            }
        }
    }

    const masked = MASKS.map((mask, number) => {
        const grid = modules.map((row, y) => row.map((dark, x) => (reserved[y][x] ? dark : dark !== mask(x, y))));
        const bits = formatBits(number);

        cells.forEach((pair, i) => pair.forEach(([x, y]) => (grid[y][x] = ((bits >>> i) & 1) === 1)));

        return grid;
    });
    const scores = masked.map(penalty);

    return masked[scores.indexOf(Math.min(...scores))];
}

// One SVG path of the dark modules, a run of them per subpath, offset by the quiet zone.
export function qrPath(matrix: boolean[][], margin: number): string {
    const parts: string[] = [];

    matrix.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
            if (!row[x]) {
                continue;
            }

            const start = x;

            while (x + 1 < row.length && row[x + 1]) {
                x++;
            }

            const run = x - start + 1;

            parts.push(`M${start + margin} ${y + margin}h${run}v1h-${run}z`);
        }
    });

    return parts.join('');
}
