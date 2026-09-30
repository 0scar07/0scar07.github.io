"""Inyecta el sprite SVG (Simple Icons CC0 + iconos de UI) en index.html. Uso: python tools/build_sprite.py"""
import re, glob, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"'
ui = {
 "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
 "arrow-left": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
 "arrow-down": '<path d="M12 5v14M6 13l6 6 6-6"/>',
 "arrow-up": '<path d="M12 19V5M6 11l6-6 6 6"/>',
 "arrow-up-right": '<path d="M7 17 17 7M8 7h9v9"/>',
 "external": '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
 "download": '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
 "mail": '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
 "copy": '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
 "check": '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 "close": '<path d="M6 6l12 12M18 6 6 18"/>',
 "pin": '<path d="M12 21s-7-6.1-7-11.2a7 7 0 1 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>',
 "cap": '<path d="M2.5 9 12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v4.5c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3V11M21.5 9v5"/>',
 "layers": '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
 "star": '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>',
 "flask": '<path d="M9 3h6M10 3v6.2L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.2V3"/><path d="M7.5 15h9"/>',
 "users": '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.4-3.4 2.9-5.5 6-5.5s5.6 2.1 6 5.5"/><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.8c1.7.7 2.8 2.4 3 5.2"/>',
 "phone": '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18h2"/>',
 "monitor": '<rect x="3" y="4" width="18" height="12.5" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/>',
 "server": '<rect x="3.5" y="4" width="17" height="6.5" rx="1.6"/><rect x="3.5" y="13.5" width="17" height="6.5" rx="1.6"/><path d="M7.5 7.2h.01M7.5 16.8h.01M11 7.2h5M11 16.8h5"/>',
 "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
 "code": '<path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5"/>',
 "db": '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>',
 "bolt": '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>',
 "sparkle": '<path d="M12 3c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7z"/><path d="M19 16.5c.2 1.4.9 2.1 2.3 2.3-1.4.2-2.1.9-2.3 2.3-.2-1.4-.9-2.1-2.3-2.3 1.4-.2 2.1-.9 2.3-2.3z"/>',
 "chip": '<rect x="6.5" y="6.5" width="11" height="11" rx="1.8"/><rect x="9.5" y="9.5" width="5" height="5" rx=".8"/><path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21"/>',
 "plug": '<path d="M9 3v5M15 3v5M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0zM12 17v4"/>',
 "chart": '<path d="M4 4v16h16"/><path d="m7.5 14.5 3.5-4 3 2.5 5-6"/>',
 "tool": '<path d="M14.7 6.3a4 4 0 0 0 5 5L21 12.6l-8.4 8.4a2.1 2.1 0 0 1-3-3L18 9.6"/><path d="M14.7 6.3 11.4 3 3 11.4l3.3 3.3"/>',
}
out = []
for k, v in ui.items():
    out.append(f'<symbol id="u-{k}" viewBox="0 0 24 24" {S}>{v}</symbol>')
out.append('<symbol id="u-linkedin" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3.3a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zM3.1 9.3h3.8V21H3.1zM9.4 9.3h3.6v1.6h.05c.5-.95 1.75-1.95 3.6-1.95 3.85 0 4.55 2.5 4.55 5.8V21h-3.8v-5.5c0-1.3 0-3-1.85-3s-2.1 1.45-2.1 2.9V21H9.4z"/></symbol>')
for f in sorted(glob.glob(os.path.join(root, 'tools/icons/*.svg'))):
    n = os.path.basename(f)[:-4]
    d = re.search(r'<path d="([^"]+)"', open(f, encoding='utf8').read()).group(1)
    out.append(f'<symbol id="i-{n}" viewBox="0 0 24 24" fill="currentColor"><path d="{d}"/></symbol>')
sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true"><!--sprite-->' + ''.join(out) + '<!--/sprite--></svg>'
p = os.path.join(root, 'index.html'); html = open(p, encoding='utf8').read()
html = re.sub(r'<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true"><!--sprite-->.*?<!--/sprite--></svg>|<!--SPRITE-->', lambda m: sprite, html, count=1, flags=re.S)
open(p, 'w', encoding='utf8', newline='\n').write(html)
print('sprite', len(out), 'symbols', len(sprite)//1024, 'KB')
