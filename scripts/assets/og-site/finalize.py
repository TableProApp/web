"""Write the delivered card: opaque RGB PNG (colour type 2), sRGB-tagged, max compression.

Also writes inspection crops: X's 2:1, the messenger square and a 500 px preview.
"""
import struct
import sys
import zlib
from pathlib import Path

from PIL import Image


def with_srgb_chunk(png: bytes) -> bytes:
    assert png[:8] == b'\x89PNG\r\n\x1a\n'
    ihdr_end = 8 + 4 + 4 + 13 + 4
    body = b'\x00'  # rendering intent: perceptual
    chunk = struct.pack('>I', 1) + b'sRGB' + body + struct.pack('>I', zlib.crc32(b'sRGB' + body) & 0xFFFFFFFF)
    return png[:ihdr_end] + chunk + png[ihdr_end:]


def finalize(raw: Path, out: Path) -> None:
    im = Image.open(raw)
    assert im.size == (1200, 630), im.size
    if im.mode != 'RGB':
        rgba = im.convert('RGBA')
        assert rgba.getextrema()[3] == (255, 255), 'render has transparent pixels'
        im = rgba.convert('RGB')
    tmp = out.with_suffix('.tmp.png')
    im.save(tmp, 'PNG', optimize=True, compress_level=9)
    out.write_bytes(with_srgb_chunk(tmp.read_bytes()))
    tmp.unlink()


if __name__ == '__main__':
    raw, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.parent.mkdir(parents=True, exist_ok=True)
    finalize(raw, out)
    im = Image.open(out)
    data = out.read_bytes()
    print(out, im.size, im.mode, 'colour type', data[25], 'bytes', len(data), 'sRGB' if b'sRGB' in data[:64] else 'untagged')
    stem = raw.stem
    im.crop((0, 15, 1200, 615)).save(raw.with_name(f'check-{stem}-x21.png'))
    im.crop((285, 0, 915, 630)).save(raw.with_name(f'check-{stem}-square.png'))
    im.resize((500, 263), Image.LANCZOS).save(raw.with_name(f'check-{stem}-500.png'))
