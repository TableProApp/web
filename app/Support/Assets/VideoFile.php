<?php

namespace App\Support\Assets;

// Reads only the container headers, so CI checks a clip without ffprobe.
final class VideoFile
{
    private const EBML = 0x1A45DFA3;

    private const DOC_TYPE = 0x4282;

    private const SEGMENT = 0x18538067;

    private const TRACKS = 0x1654AE6B;

    private const TRACK_ENTRY = 0xAE;

    private const CODEC_ID = 0x86;

    private const VIDEO = 0xE0;

    private const PIXEL_WIDTH = 0xB0;

    private const PIXEL_HEIGHT = 0xBA;

    /**
     * @return array{container: string, codec: string, width: int, height: int, faststart: bool}|null
     */
    public static function probe(string $path): ?array
    {
        $bytes = is_file($path) ? (string) file_get_contents($path) : '';

        if (substr($bytes, 4, 4) === 'ftyp') {
            return self::mp4($bytes);
        }

        if (strlen($bytes) >= 4 && unpack('N', $bytes)[1] === self::EBML) {
            return self::matroska($bytes);
        }

        return null;
    }

    /**
     * @return array{container: string, codec: string, width: int, height: int, faststart: bool}|null
     */
    private static function mp4(string $bytes): ?array
    {
        $top = self::boxes($bytes, 0, strlen($bytes));
        $types = array_column($top, 0);
        $moov = array_search('moov', $types, true);
        $mdat = array_search('mdat', $types, true);

        if ($moov === false) {
            return null;
        }

        foreach (self::boxes($bytes, $top[$moov][1], $top[$moov][2]) as [$type, $start, $end]) {
            if ($type !== 'trak') {
                continue;
            }

            $mdia = self::child($bytes, $start, $end, 'mdia');
            $hdlr = $mdia === null ? null : self::child($bytes, $mdia[0], $mdia[1], 'hdlr');

            if ($hdlr === null || substr($bytes, $hdlr[0] + 8, 4) !== 'vide') {
                continue;
            }

            $stsd = $mdia;

            foreach (['minf', 'stbl', 'stsd'] as $name) {
                $stsd = $stsd === null ? null : self::child($bytes, $stsd[0], $stsd[1], $name);
            }

            // A full box: 4 bytes of version and flags, then a 4-byte entry count.
            $entry = $stsd === null ? [] : self::boxes($bytes, $stsd[0] + 8, $stsd[1]);

            if ($entry === [] || $entry[0][1] + 28 > $entry[0][2]) {
                return null;
            }

            // A visual sample entry keeps its width and height 24 bytes in.
            $size = unpack('nwidth/nheight', $bytes, $entry[0][1] + 24);

            return [
                'container' => 'mp4',
                'codec' => $entry[0][0],
                'width' => $size['width'],
                'height' => $size['height'],
                'faststart' => $mdat === false || $moov < $mdat,
            ];
        }

        return null;
    }

    /**
     * @return array{container: string, codec: string, width: int, height: int, faststart: bool}|null
     */
    private static function matroska(string $bytes): ?array
    {
        $top = self::elements($bytes, 0, strlen($bytes));
        $header = self::element($top, self::EBML);
        $segment = self::element($top, self::SEGMENT);
        $docType = $header === null ? null : self::element(self::elements($bytes, $header[0], $header[1]), self::DOC_TYPE);
        $tracks = $segment === null ? null : self::element(self::elements($bytes, $segment[0], $segment[1]), self::TRACKS);

        if ($tracks === null) {
            return null;
        }

        foreach (self::elements($bytes, $tracks[0], $tracks[1]) as [$id, $start, $end]) {
            if ($id !== self::TRACK_ENTRY) {
                continue;
            }

            $fields = self::elements($bytes, $start, $end);
            $video = self::element($fields, self::VIDEO);
            $codec = self::element($fields, self::CODEC_ID);

            if ($video === null || $codec === null) {
                continue;
            }

            $picture = self::elements($bytes, $video[0], $video[1]);
            $width = self::element($picture, self::PIXEL_WIDTH);
            $height = self::element($picture, self::PIXEL_HEIGHT);

            if ($width === null || $height === null) {
                return null;
            }

            return [
                'container' => $docType !== null && self::text($bytes, $docType) === 'webm' ? 'webm' : 'matroska',
                'codec' => self::text($bytes, $codec),
                'width' => self::uint($bytes, $width),
                'height' => self::uint($bytes, $height),
                'faststart' => true,
            ];
        }

        return null;
    }

    /**
     * @return list<array{0: string, 1: int, 2: int}> each box's type, payload start and end
     */
    private static function boxes(string $bytes, int $start, int $end): array
    {
        $boxes = [];
        $offset = $start;

        while ($offset + 8 <= $end) {
            $size = unpack('N', $bytes, $offset)[1];
            $header = 8;

            if ($size === 1) {
                if ($offset + 16 > $end) {
                    break;
                }

                $size = unpack('J', $bytes, $offset + 8)[1];
                $header = 16;
            } elseif ($size === 0) {
                $size = $end - $offset;
            }

            if ($size < $header || $offset + $size > $end) {
                break;
            }

            $boxes[] = [substr($bytes, $offset + 4, 4), $offset + $header, $offset + $size];
            $offset += $size;
        }

        return $boxes;
    }

    /**
     * @return array{0: int, 1: int}|null
     */
    private static function child(string $bytes, int $start, int $end, string $type): ?array
    {
        foreach (self::boxes($bytes, $start, $end) as [$name, $from, $to]) {
            if ($name === $type) {
                return [$from, $to];
            }
        }

        return null;
    }

    /**
     * @return list<array{0: int, 1: int, 2: int}> each element's id, data start and end
     */
    private static function elements(string $bytes, int $start, int $end): array
    {
        $elements = [];
        $offset = $start;

        while ($offset < $end) {
            $id = self::vint($bytes, $offset, true);
            $size = $id === null ? null : self::vint($bytes, $offset + $id[1], false);

            if ($id === null || $size === null) {
                break;
            }

            $data = $offset + $id[1] + $size[1];
            // An unknown size runs to the end of its parent.
            $stop = $size[2] ? $end : $data + $size[0];

            if ($stop > $end) {
                break;
            }

            $elements[] = [$id[0], $data, $stop];
            $offset = $stop;
        }

        return $elements;
    }

    /**
     * @param  list<array{0: int, 1: int, 2: int}>  $elements
     * @return array{0: int, 1: int}|null
     */
    private static function element(array $elements, int $id): ?array
    {
        foreach ($elements as [$found, $start, $end]) {
            if ($found === $id) {
                return [$start, $end];
            }
        }

        return null;
    }

    /**
     * @return array{0: int, 1: int, 2: bool}|null the value, its length in bytes, and whether it is the unknown size
     */
    private static function vint(string $bytes, int $offset, bool $keepMarker): ?array
    {
        if ($offset >= strlen($bytes)) {
            return null;
        }

        $first = ord($bytes[$offset]);
        $length = 1;

        while ($length <= 8 && ($first & (0x80 >> ($length - 1))) === 0) {
            $length++;
        }

        if ($length > 8 || $offset + $length > strlen($bytes)) {
            return null;
        }

        $value = $keepMarker ? $first : $first & ((0x80 >> ($length - 1)) - 1);

        for ($i = 1; $i < $length; $i++) {
            $value = ($value << 8) | ord($bytes[$offset + $i]);
        }

        return [$value, $length, ! $keepMarker && $value === (1 << (7 * $length)) - 1];
    }

    /**
     * @param  array{0: int, 1: int}  $range
     */
    private static function uint(string $bytes, array $range): int
    {
        $value = 0;

        for ($i = $range[0]; $i < $range[1]; $i++) {
            $value = ($value << 8) | ord($bytes[$i]);
        }

        return $value;
    }

    /**
     * @param  array{0: int, 1: int}  $range
     */
    private static function text(string $bytes, array $range): string
    {
        return rtrim(substr($bytes, $range[0], $range[1] - $range[0]), "\0");
    }
}
