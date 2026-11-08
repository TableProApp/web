import { test } from 'node:test';
import assert from 'node:assert/strict';

import platforms from '../../resources/data/platforms.json' with { type: 'json' };
import { qrMatrix, qrPath } from '../../resources/js/lib/qr.ts';

// A reader written from the QR specification, not from the encoder: it finds the format, removes the mask, reads the
// codewords in placement order, checks every block's Reed-Solomon syndromes and parses the byte segment.

const LEVEL_M_BLOCKS: Record<number, { ec: number; blocks: number; data: number }> = {
    1: { ec: 10, blocks: 1, data: 16 },
    2: { ec: 16, blocks: 1, data: 28 },
    3: { ec: 26, blocks: 1, data: 44 },
    4: { ec: 18, blocks: 2, data: 32 },
    5: { ec: 24, blocks: 2, data: 43 },
    6: { ec: 16, blocks: 4, data: 27 },
};

const ALIGNMENT_CENTRES: Record<number, number[]> = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34] };

function gf(): { exp: number[]; log: number[] } {
    const exp: number[] = [];
    const log: number[] = [];

    for (let i = 0, value = 1; i < 255; i++) {
        exp[i] = value;
        log[value] = i;
        value = value & 0x80 ? ((value << 1) ^ 0x11d) & 0xff : value << 1;
    }

    return { exp, log };
}

function syndromesAreZero(block: number[], ec: number): boolean {
    const { exp, log } = gf();
    const times = (a: number, b: number): number => (a === 0 || b === 0 ? 0 : exp[(log[a] + log[b]) % 255]);

    for (let i = 0; i < ec; i++) {
        let sum = 0;

        for (const word of block) {
            sum = times(sum, exp[i]) ^ word;
        }

        if (sum !== 0) {
            return false;
        }
    }

    return true;
}

function functionModules(size: number, version: number): boolean[][] {
    const taken = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
    const square = (left: number, top: number, side: number): void => {
        for (let y = top; y < top + side; y++) {
            for (let x = left; x < left + side; x++) {
                taken[y][x] = true;
            }
        }
    };

    // Each finder with its separator.
    square(0, 0, 8);
    square(size - 8, 0, 8);
    square(0, size - 8, 8);

    for (const cy of ALIGNMENT_CENTRES[version]) {
        for (const cx of ALIGNMENT_CENTRES[version]) {
            if (!taken[cy][cx]) {
                square(cx - 2, cy - 2, 5);
            }
        }
    }

    for (let i = 0; i < size; i++) {
        taken[6][i] = true;
        taken[i][6] = true;
    }

    // The format areas, and the dark module above the bottom-left one.
    for (let i = 0; i < 9; i++) {
        taken[8][i] = true;
        taken[i][8] = true;
    }

    for (let i = 0; i < 8; i++) {
        taken[8][size - 1 - i] = true;
        taken[size - 1 - i][8] = true;
    }

    return taken;
}

function decode(matrix: boolean[][]): string {
    const size = matrix.length;
    const version = (size - 17) / 4;
    const layout = LEVEL_M_BLOCKS[version];

    assert.ok(layout !== undefined, `a ${size}-module code is not a level M version 1 to 6`);

    // Format bits 14 down to 9 run along row 8 left to right, then 8 to 0 up column 8, skipping the timing row.
    const order: Array<[number, number]> = [
        [0, 8],
        [1, 8],
        [2, 8],
        [3, 8],
        [4, 8],
        [5, 8],
        [7, 8],
        [8, 8],
        [8, 7],
        [8, 5],
        [8, 4],
        [8, 3],
        [8, 2],
        [8, 1],
        [8, 0],
    ];
    const read = order.reduce((bits, [x, y]) => (bits << 1) | (matrix[y][x] ? 1 : 0), 0);
    // The specification's table of level M format strings, masks 0 to 7, after the 101010000010010 XOR.
    const mask = [0b101010000010010, 0b101000100100101, 0b101111001111100, 0b101101101001011, 0b100010111111001, 0b100000011001110, 0b100111110010111, 0b100101010100000].indexOf(read);

    assert.ok(mask !== -1, 'the format bits name level M and a mask');

    const flip: Record<number, (row: number, column: number) => boolean> = {
        0: (i, j) => (i + j) % 2 === 0,
        1: (i) => i % 2 === 0,
        2: (_, j) => j % 3 === 0,
        3: (i, j) => (i + j) % 3 === 0,
        4: (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0,
        5: (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0,
        6: (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0,
        7: (i, j) => (((i * j) % 3) + ((i + j) % 2)) % 2 === 0,
    };
    const taken = functionModules(size, version);
    const bits: number[] = [];
    let upward = true;

    for (let column = size - 1; column > 0; column -= 2) {
        if (column === 6) {
            column--;
        }

        for (let step = 0; step < size; step++) {
            const row = upward ? size - 1 - step : step;

            for (const x of [column, column - 1]) {
                if (!taken[row][x]) {
                    bits.push(matrix[row][x] !== flip[mask](row, x) ? 1 : 0);
                }
            }
        }

        upward = !upward;
    }

    const total = layout.blocks * (layout.data + layout.ec);
    const words = Array.from({ length: total }, (_, i) => bits.slice(i * 8, i * 8 + 8).reduce((byte, bit) => (byte << 1) | bit, 0));
    const blocks = Array.from({ length: layout.blocks }, () => [] as number[]);

    words.forEach((word, i) => {
        const block = i < layout.blocks * layout.data ? i % layout.blocks : (i - layout.blocks * layout.data) % layout.blocks;
        blocks[block].push(word);
    });

    blocks.forEach((block, i) => assert.ok(syndromesAreZero(block, layout.ec), `block ${i} has no Reed-Solomon errors`));

    const data = blocks.flatMap((block) => block.slice(0, layout.data));
    const stream = data.flatMap((word) => Array.from({ length: 8 }, (_, i) => (word >>> (7 - i)) & 1));
    const take = (count: number): number => stream.splice(0, count).reduce((value, bit) => (value << 1) | bit, 0);

    assert.equal(take(4), 0b0100, 'one byte-mode segment');

    const length = take(8);

    return new TextDecoder().decode(Uint8Array.from({ length }, () => take(8)));
}

function fromPath(path: string, margin: number): boolean[][] {
    const runs = [...path.matchAll(/M(\d+) (\d+)h(\d+)v1h-\3z/g)].map((match) => match.slice(1).map(Number));
    const size = Math.max(...runs.map(([x, , run]) => x + run)) - margin;
    const matrix = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));

    assert.equal(runs.map((match) => `M${match[0]} ${match[1]}h${match[2]}v1h-${match[2]}z`).join(''), path, 'the path is only module runs');

    for (const [x, y, run] of runs) {
        for (let i = 0; i < run; i++) {
            matrix[y - margin][x - margin + i] = true;
        }
    }

    return matrix;
}

const appStoreUrl = platforms.platforms.find((platform) => platform.id === 'ios')?.destinations?.find((destination) => destination.kind === 'app-store')?.url;

test('the App Store QR code on /download encodes the App Store URL from platforms.json', () => {
    assert.ok(typeof appStoreUrl === 'string' && appStoreUrl.startsWith('https://apps.apple.com/'));

    const matrix = fromPath(qrPath(qrMatrix(appStoreUrl), 4), 4);

    assert.equal(decode(matrix), appStoreUrl);
});

test('a QR code round-trips text of every version it supports', () => {
    for (const text of ['A', 'https://tablepro.app', 'x'.repeat(40), 'é'.repeat(30), 'y'.repeat(84), 'z'.repeat(106)]) {
        assert.equal(decode(qrMatrix(text)), text);
    }

    assert.throws(() => qrMatrix('x'.repeat(107)), RangeError);
});
