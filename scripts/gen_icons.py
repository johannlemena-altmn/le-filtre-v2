#!/usr/bin/env python3
# Génère les icônes PWA de Le Filtre (motif ◐ — le rituel) en PNG pur,
# sans dépendance externe. Palette papier du design system.
import zlib, struct, math, os

PAPER = (244, 238, 226)   # --bg
TERRE = (196, 112, 80)    # --terre
INK   = (44, 40, 34)      # --ink

OUT = os.path.join(os.path.dirname(__file__), "..", "icons")
os.makedirs(OUT, exist_ok=True)

def write_png(path, w, h, rgb):
    def chunk(typ, data):
        c = struct.pack(">I", len(data)) + typ + data
        return c + struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff)
    raw = bytearray()
    for y in range(h):
        raw.append(0)  # filtre None
        for x in range(w):
            raw += bytes(rgb[y*w + x])
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)  # 8-bit, truecolor
    png = sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)

def render(size, ss=3, maskable=False):
    """Rend l'icône à 'size' px, supersampling ss pour l'anti-aliasing."""
    S = size * ss
    c = S / 2.0
    # zone sûre plus petite si maskable (iOS/Android rognent les coins)
    disk_r = S * (0.34 if maskable else 0.40)
    ring_w = S * 0.022
    buf = [PAPER] * (S * S)
    for y in range(S):
        for x in range(S):
            dx = x - c + 0.5
            dy = y - c + 0.5
            d = math.hypot(dx, dy)
            if d <= disk_r - ring_w:
                # intérieur du disque : moitié gauche pleine (terre) → motif ◐
                buf[y*S + x] = TERRE if dx < 0 else PAPER
            elif d <= disk_r:
                buf[y*S + x] = INK  # anneau
    # downsample (moyenne des blocs ss x ss)
    out = [PAPER] * (size * size)
    inv = 1.0 / (ss * ss)
    for oy in range(size):
        for ox in range(size):
            r = g = b = 0
            for sy in range(ss):
                row = (oy*ss + sy) * S + ox*ss
                for sx in range(ss):
                    px = buf[row + sx]
                    r += px[0]; g += px[1]; b += px[2]
            out[oy*size + ox] = (round(r*inv), round(g*inv), round(b*inv))
    return out

targets = [
    ("icon-192.png", 192, 3, False),
    ("icon-512.png", 512, 2, False),
    ("icon-maskable-512.png", 512, 2, True),
    ("apple-touch-icon.png", 180, 3, False),
]
for name, size, ss, mask in targets:
    px = render(size, ss, mask)
    write_png(os.path.join(OUT, name), size, size, px)
    print("écrit", name)
