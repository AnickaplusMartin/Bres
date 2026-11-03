# -*- coding: utf-8 -*-
"""Generátor statického webu BRES.  Použití (z kořene repozitáře):
  python generator/build.py                 lokální verze (otevřít index.html)
  python generator/build.py --hosting       čisté URL pro hosting s PHP
  python generator/build.py --demo          ukázka pro GitHub Pages (noindex, bez formuláře)
  přepínače: --out SLOŽKA, --text=old (původní texty)"""
import json, re, sys, os, shutil, html
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
def opt(name, default=None):
    for i, a in enumerate(sys.argv):
        if a == name and i + 1 < len(sys.argv): return sys.argv[i + 1]
    return default
HOST = "--hosting" in sys.argv   # čisté URL (/produkty/sav/) pro hosting s vlastní doménou
DEMO = "--demo" in sys.argv      # ukázka pro GitHub Pages: noindex, bez formuláře, relativní odkazy
OGB = (opt("--base-url", "https://www.bres.cz") or "").rstrip("/")
NEW = "--text=old" not in sys.argv   # výchozí: aktuální texty; --text=old = původní z bres.cz
BASE = "https://www.bres.cz"
OUT = os.path.abspath(opt("--out", os.path.join(ROOT, "vystup", "bres-web")))
WARN = []
def parse(path):
    t = open(path, encoding="utf-8-sig").read().replace("\r\n", "\n")
    m = re.match(r"---\n(.*?)\n---\n(.*)", t, re.S)
    if not m: sys.exit(f"CHYBA: soubor {os.path.basename(path)} nemá na začátku hlavičku (path:, title:, order: mezi dvěma řádky ---).")
    meta = {k.strip(): v.strip() for k, v in (l.split(":", 1) for l in m.group(1).splitlines() if ":" in l)}
    for k in ("path", "title"):
        if k not in meta: sys.exit(f"CHYBA: v souboru {os.path.basename(path)} chybí v hlavičce '{k}:'.")
    return meta, m.group(2).strip()
def load(folder):
    out = {}
    d_ = os.path.join(ROOT, folder)
    if not os.path.isdir(d_): return out
    for f in sorted(os.listdir(d_)):
        if f.endswith(".html"):
            meta, c = parse(os.path.join(d_, f))
            out[meta["path"]] = {"path": meta["path"], "title": meta["title"], "menu_order": int(meta.get("order", 50)), "content": c, "file": f}
    return out
S = json.load(open(os.path.join(ROOT, "nastaveni.json"), encoding="utf-8"))
_pg = load("obsah")
if not NEW: _pg.update(load("obsah-puvodni"))
D = {"site": S["site"], "menu": S["menu"], "pages": sorted(_pg.values(), key=lambda p: p["menu_order"])}
pages = {p["path"]: p for p in D["pages"]}
os.chdir(HERE)
site = D["site"]; tel = site["paticka"]

def url(path, depth):
    if HOST: return "/" + ("" if path == "domu" else path + "/")
    return "../" * depth + ("" if path == "domu" else path + "/") + "index.html"
def depth_of(path): return 0 if path == "domu" else path.count("/") + 1
def fix_links(h, depth):
    def r(m):
        p = m.group(1).strip("/")
        if p and p not in pages: WARN.append("odkaz na neexistující stránku /" + p + "/")
        return 'href="' + url(p if p in pages else "domu", depth) + '"'
    return re.sub(r'href="/([^"#]*)"', r, h)

def turbine(x, y, s, cls):
    tw = f'<path class="tw" d="M{x-5*s:.0f} 800L{x-2*s:.0f} {y}H{x+2*s:.0f}L{x+5*s:.0f} 800Z"/>'
    bl = "".join(f'<path class="bl" transform="rotate({a})" d="M-6 0C-5 -60 -2 -130 0 -175C3 -130 5 -60 6 0Z"/>' for a in (0, 120, 240))
    return tw + f'<g transform="translate({x} {y}) scale({s})"><g class="rot {cls}">{bl}</g><circle r="9" fill="#fff"/></g>'
SVG = ('<svg class="tur" viewBox="0 0 1600 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">'
       '<path d="M0 800V735Q400 690 800 730T1600 705V800Z" fill="#0f3d5a" opacity=".35"/>'
       + turbine(860, 500, .75, "c") + turbine(1080, 400, 1.2, "a") + turbine(1360, 300, 1.7, "b") + turbine(1600, 210, 2.5, "c") + '</svg>')

SLIDES = [
    ("Projekce a realizace energetických celků.", "Váš partner v oblasti tepelné energie. Od studie a projektu přes realizaci až po provoz.", "predmet-cinnosti", "Co děláme"),
    ("Projektová činnost v oblasti TZB a technologických staveb", "Výroba a prodej tepelné energie, provoz energetických celků, realizace technologických staveb.", "produkty/projekce", "Projekce"),
    ("Zpracování výkresů ve 3D podobě", "Projekty energetických celků, spolupráce s realizátory staveb, technický a stavební dozor.", "reference", "Reference"),
]

SLIDES = [
    ("Projekce a realizace energetických celků", "Váš partner v oblasti tepelné energie. Od studie a projektu přes realizaci až po provoz tepelného hospodářství.", "predmet-cinnosti", "Co děláme"),
    ("Projektová činnost v oblasti TZB a technologických staveb", "Výroba a prodej tepelné energie, provoz energetických celků a realizace technologických staveb.", "produkty/projekce", "Projekce"),
    ("Výkresy ve 3D podobě", "Energetické celky projektujeme ve 3D a spolupracujeme s realizátory staveb. Zajišťujeme také technický a stavební dozor.", "reference", "Reference"),
]
SL_IMG = ["plant-blue", "plant-night", "cad"]
PH = [("plan-meeting", "Konzultace", "produkty/konzultace"), ("cad", "Projekce", "produkty/projekce"),
      ("pipes", "Realizace", "produkty/realizace-energetickych-staveb"), ("thermo", "Provoz a optimalizace", "predmet-cinnosti")]
BAN = {k: tuple(v) for k, v in S.get("bannery", {}).items()}
SLUZBY = set(S.get("sluzby", []))
import struct
EXTRA_HEAD = {}
def _png_dims(p):
    d = open(p, "rb").read(24); return struct.unpack(">II", d[16:24])
def _webp_dims(p):
    d = open(p, "rb").read(32)
    if d[12:16] == b"VP8 ": return (struct.unpack("<H", d[26:28])[0] & 0x3FFF, struct.unpack("<H", d[28:30])[0] & 0x3FFF)
    if d[12:16] == b"VP8L": v = struct.unpack("<I", d[21:25])[0]; return ((v & 0x3FFF) + 1, ((v >> 14) & 0x3FFF) + 1)
    if d[12:16] == b"VP8X": return (1 + int.from_bytes(d[24:27], "little"), 1 + int.from_bytes(d[27:30], "little"))
_pd = _webp_dims("img/bres-logo.webp") if os.path.exists("img/bres-logo.webp") else None
LOGO = f' width="{_pd[0]}" height="{_pd[1]}"' if _pd else ""
def dims(n, sz):
    p = f"img/{n}-{sz}.webp"
    r = _webp_dims(p) if os.path.exists(p) else None
    return f' width="{r[0]}" height="{r[1]}"' if r else ""
def hero_img(n, i):
    ss = lambda ext: ", ".join(f"assets/img/{n}-{s}.{ext} {w}w" for s, w in (("s", 480), ("m", 800), ("l", 1600)))
    if i == 0:
        av = ss("avif")
        EXTRA_HEAD["domu"] = f'<link rel="preload" as="image" type="image/avif" imagesrcset="{av}" imagesizes="100vw" fetchpriority="high">'
        return f'<picture><source type="image/avif" srcset="{av}" sizes="100vw"><img src="assets/img/{n}-l.webp" srcset="{ss("webp")}" sizes="100vw" alt="" class="on" fetchpriority="high"{dims(n, "l")}></picture>'
    return f'<img data-src="assets/img/{n}-l.webp" data-srcset="{ss("webp")}" sizes="100vw" alt=""{dims(n, "l")}>'
def img(n, sz, depth): return "../" * depth + f"assets/img/{n}-{sz}.webp"
CATS = [tuple(x) for x in S.get("kategorie", [])]
REFIMG = [tuple(x) for x in S.get("reference_fotky", [])]
HOMEREF = [tuple(x) for x in S.get("reference_na_uvodu", [])]
def rimg(x, depth):
    import re as _r
    t = _r.sub(r"<[^>]+>", "", _r.search(r"<h3>(.*?)</h3>", x).group(1))
    for k, n in REFIMG:
        if k.lower() in t.lower(): return f'<img class="rimg" src="{img("ref-" + n, "m", depth)}" alt="{html.escape(t)}" loading="lazy"{dims("ref-" + n, "m")}>'
    return ""
def nav(items, depth, cur):
    o = "<ul>"
    for it in items:
        href = url(it["path"], depth) if "path" in it else "#"
        on = ' class="on" aria-current="page"' if it.get("path") == cur else ""
        sub = nav(it["children"], depth, cur) if it.get("children") else ""
        o += f'<li><a href="{href}"{on}>{it["title"]}</a>{sub}</li>'
    return o + "</ul>"

ARW = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ARD = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
# --- Preloader (splash): oheň a kouř kreslí app.js do <canvas>; HTML se vkládá hned za <body>, krátký skript do <head> ---
PRE_HEAD = '<script>(function(){var d=document.documentElement;try{if(matchMedia("(prefers-reduced-motion:reduce)").matches||(location.search.indexOf("splash")<0&&(localStorage.getItem("bresPre")||location.hash)))d.className+=" no-pre";else localStorage.setItem("bresPre","1")}catch(e){d.className+=" no-pre"}})()</script>'
PRE_HTML = """<div id="pre" aria-hidden="true"><canvas></canvas><div class="pre-in"><img src="__P__assets/img/bres-logo-bila.webp" alt="" __L__>
<div class="pre-bar"><i></i></div><p>Váš partner v oblasti tepelné energie</p></div></div>
"""
def _fin(s): return s.replace("<b>↗</b>", "<b>" + ARW + "</b>").replace('aria-label="Přejít na obsah">↓</a>', 'aria-label="Přejít na obsah">' + ARD + "</a>")
def shell(*a, **k): return _fin(_shell(*a, **k))
def _shell(title, body, depth, cur, desc=""):
    pre = "../" * depth
    pre_html = PRE_HTML.replace("__P__", pre).replace("__L__", LOGO.strip()) if cur == "domu" else ""
    pre_head = PRE_HEAD if cur == "domu" else ""
    canon = BASE + ("/" if cur == "domu" else "/" + cur + "/")
    d = html.escape(desc or title)
    og = "social.jpg"
    if cur != "domu" and os.path.exists("img/social/" + cur.replace("/", "--") + ".jpg"): og = "social/" + cur.replace("/", "--") + ".jpg"
    pl = "".join(f'<link rel="preload" href="{pre}assets/fonts/inter-{s}-wght-normal.woff2" as="font" type="font/woff2" crossorigin>\n' for s in ("latin", "latin-ext")) if (HOST or DEMO) else ""
    ico = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath fill='%23FF6B14' d='M11 2h12l-6 28H5z'/%3E%3C/svg%3E"
    head = (f'<link rel="icon" href="{ico}"><link rel="canonical" href="{canon}">'
            f'<meta property="og:type" content="website"><meta property="og:locale" content="cs_CZ"><meta property="og:site_name" content="BRES.CZ">'
            f'<meta property="og:title" content="{html.escape(title)}"><meta property="og:description" content="{d}"><meta property="og:url" content="{canon}"><meta property="og:image" content="{OGB}/assets/img/{og}"><meta name="twitter:card" content="summary_large_image">')
    if cur == "domu":
        ld = {"@context": "https://schema.org", "@type": "LocalBusiness", "name": "BRES spol. s r.o.", "url": BASE + "/", "logo": BASE + "/assets/img/bres-logo.png",
              "email": tel["email"], "telephone": tel["telefony"][0],
              "address": {"@type": "PostalAddress", "streetAddress": "Vranovská 768/95", "addressLocality": "Brno-Husovice", "postalCode": "614 00", "addressCountry": "CZ"}}
        head += '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>'
    if cur != "domu" and cur in pages:
        segs = cur.split("/"); items = [{"@type": "ListItem", "position": 1, "name": "Domů", "item": BASE + "/"}]
        for i in range(len(segs)):
            q = "/".join(segs[:i + 1])
            if q in pages: items.append({"@type": "ListItem", "position": len(items) + 1, "name": pages[q]["title"], "item": BASE + "/" + q + "/"})
        head += '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}, ensure_ascii=False) + '</script>'
        if cur in SLUZBY:
            head += '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@type": "Service", "name": pages[cur]["title"], "description": desc or title, "url": canon, "provider": {"@type": "Organization", "name": "BRES spol. s r.o.", "url": BASE + "/"}}, ensure_ascii=False) + '</script>'
    head += EXTRA_HEAD.get(cur, "")
    if DEMO:
        head = re.sub(r'<link rel="canonical"[^>]*>|<meta property="og:url"[^>]*>|<script type="application/ld\+json">.*?</script>', "", head, flags=re.S) + '<meta name="robots" content="noindex, nofollow">'
        title = "[Ukázka] " + title
    return f'''<!doctype html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#122350">
<title>{html.escape(title)}</title><meta name="description" content="{d}">
<script>document.documentElement.className+=" js"</script>{pre_head}
{pl}<link rel="stylesheet" href="{pre}assets/style.css">{head}</head><body>{pre_html}<a class="skip" href="#main">Přeskočit na obsah</a>
<header class="hd"><div class="wrap in"><a class="logo" href="{url("domu", depth)}"><img src="{pre}assets/img/bres-logo.webp" alt="BRES"{LOGO} fetchpriority="low" decoding="async"></a>
<button class="burger" aria-expanded="false" aria-label="Menu">Menu</button>
<nav aria-label="Hlavní menu">{nav(D["menu"]["items"], depth, cur)}<a class="nav-cta" href="{url("kontakt", depth)}#poptavka">Poptat projekt</a></nav>
<a class="sos" href="tel:{tel["havarijni_sluzba"].replace(" ", "")}" aria-label="Havarijní služba {tel["havarijni_sluzba"]}"><span>Havarijní služba</span><b>{tel["havarijni_sluzba"]}</b><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"/></svg></a></div></header>
{body}
<footer class="ft"><div class="wrap"><div class="cols">
<div><img class="ft-logo" src="{pre}assets/img/bres-logo-bila.webp" alt="BRES"{LOGO} loading="lazy" decoding="async"><h2>BRES spol. s r.o.</h2><p>Vranovská 768/95<br>Brno-Husovice 614 00</p><p>IČ: 29220289 · DIČ: CZ29220289</p></div>
<div><h2>Kontakt</h2><p><a href="mailto:{tel["email"]}">{tel["email"]}</a></p><p>{tel["telefony"][0]}<br>{tel["telefony"][1]}</p></div>
<div><h2>Havarijní služba</h2><p>Provoz tepelných zdrojů</p><p><a href="tel:{tel["havarijni_sluzba"].replace(" ", "")}">{tel["havarijni_sluzba"]}</a></p></div></div>
<div class="cp">© BRES spol. s r.o. · <a href="{url("zasady-ochrany-osobnich-udaju", depth)}">Zásady zpracování osobních údajů</a> · Ilustrační fotografie: Unsplash{" · Ukázková verze, neoficiální náhled redesignu" if DEMO else ""}</div></div></footer>
<script src="{pre}assets/app.js"></script></body></html>'''

def home(p):
    c = p["content"]
    svc = re.findall(r"<li>(.*?)</li>", re.search(r"<h3>CO DĚLÁME</h3>\s*<ul>(.*?)</ul>", pages["domu"]["content"], re.S).group(1))
    pill = re.findall(r'<h3>(.*?)</h3>\s*<p>(.*?)</p>\s*<p><a href="(.*?)">', c)[-4:]
    sl = "".join(f'<div class="sl{" on" if i == 0 else ""}"><p class="h1">{h}</p><p>{t}</p><a class="btn" href="{url(l, 0)}"><span>{b}</span><b>↗</b></a></div>' for i, (h, t, l, b) in enumerate(SLIDES))
    bg = '<div class="bg">' + "".join(hero_img(n, i) for i, n in enumerate(SL_IMG)) + "</div>"
    hero = f'<section class="hero" data-s="0"><h1 class="sr">BRES – projekce TZB a energetických celků</h1>{bg}<div class="wrap" style="height:100%"><div class="txt">{sl}</div></div><div class="ctl"><button class="pp" aria-label="Pozastavit"></button><div class="bar"><span class="cur">01</span><span class="tr"><i></i></span><span>0{len(SLIDES)}</span>{"".join(f"<button class=d aria-label=Snímek{i+1}></button>" for i in range(len(SLIDES)))}</div></div><a class="down" href="#start" aria-label="Přejít na obsah">↓</a></section>'
    ph = "".join(f'<a class="ph" href="{url(l, 0)}"><img src="{img(n, "m", 0)}" alt="" loading="lazy"{dims(n, "m")}><span>{t}</span></a>' for n, t, l in PH)
    s1 = f'<section class="sec" id="start"><div class="wrap"><p class="lab">Co děláme</p><h2>Projektujeme, realizujeme a provozujeme energetické celky</h2><ul class="svc">{"".join(f"<li>{x}</li>" for x in svc)}</ul><div class="svcards">{ph}</div><a class="more" href="{url("predmet-cinnosti", 0)}">Předmět činnosti</a></div></section>'
    cards = "".join(f'<div class="card"><h3>{h}</h3><p>{t}</p><a href="{url(l.strip("/"), 0)}">Více informací<span class="sr"> – {h}</span></a></div>' for h, t, l in pill)
    s2 = f'<section class="sec alt"><div class="wrap"><p class="lab">Naše přístupy</p><h2>Individuální přístup se zaměřením na snížení provozních nákladů</h2><div class="cards">{cards}</div></div></section>'
    rc = "".join(f'<a class="rc" href="{url("reference", 0)}"><img src="{img("ref-" + n, "m", 0)}" alt="" loading="lazy"{dims("ref-" + n, "m")}><span>{t}</span></a>' for n, t in HOMEREF)
    s2b = f'<section class="sec"><div class="wrap"><p class="lab">Reference</p><h2>Z našich referencí</h2><div class="rcards">{rc}</div><a class="more" href="{url("reference", 0)}">Všechny reference</a></div></section>'
    s3 = f'<section class="cta" style="--bi:url(img/wind-field-l.webp);--bm:url(img/wind-field-m.webp)"><div class="wrap in"><h2>Potřebujete poradit nebo poptat projekt?</h2><div><a class="tel" href="tel:{tel["telefony"][0].replace(" ", "")}">{tel["telefony"][0]}</a><br><a href="mailto:{tel["email"]}" style="color:#fff">{tel["email"]}</a></div></div></section>'
    return hero + s1 + s2 + s2b + s3

def linkify(h):
    def f(m):
        if m.group(1) or m.group(2): return m.group(0)
        if m.group(3): return '<a href="tel:' + re.sub(r"\s", "", m.group(3)) + '">' + m.group(3) + '</a>'
        return f'<a href="mailto:{m.group(4)}">{m.group(4)}</a>'
    return re.sub(r'(<a\b.*?</a>)|(<[^>]+>)|(\+420(?:\s\d{3}){3})|([\w.\-]+@bres\.cz)', f, h, flags=re.S)
def relevel(h):
    stack = []
    def f(m):
        L = int(m.group(1))
        while stack and stack[-1][0] >= L: stack.pop()
        new = stack[-1][1] + 1 if stack else 2
        stack.append((L, new))
        return f'<h{new}{m.group(2)} class="t{L}">{m.group(3)}</h{new}>'
    return re.sub(r"<h([2-6])([^>]*)>(.*?)</h\1>", f, h, flags=re.S)
MAP = ('<div class="map"><iframe title="Mapa sídla BRES" data-src="https://frame.mapy.cz/s/kodalofego" referrerpolicy="no-referrer"></iframe>'
       '<div class="map-ph"><p><strong>Vranovská 768/95, Brno-Husovice</strong></p><button type="button" class="btn"><span>Zobrazit mapu</span><b>↗</b></button>'
       '<p class="small">Po kliknutí se načte mapa ze služby Mapy.cz. <a href="https://frame.mapy.cz/s/kodalofego">Otevřít na Mapy.cz</a></p></div></div>')
def inner(p):
    path, depth = p["path"], depth_of(p["path"]); c = p["content"]
    if not c:
        kids = [q for k, q in pages.items() if k.startswith(path + "/") and k.count("/") == path.count("/") + 1]
        c = '<div class="kids">' + "".join(f'<a href="{url(q["path"], depth)}">{q["title"]}</a>' for q in kids) + "</div>"
    wide = ""
    if path == "reference":
        parts = re.split(r"(?=<h3>)", c); wide = " wide"
        intro = parts[0] if parts and not parts[0].startswith("<h3>") else ""; parts = [x for x in parts if x.startswith("<h3>")]
        def cat(x):
            x = re.search(r'<h3>(.*?)</h3>', x).group(1)
            for k, v in CATS:
                if k.lower() in x.lower(): return v
            return "Ostatní"
        _cats = []
        for _x in parts:
            _k = cat(_x)
            if _k not in _cats: _cats.append(_k)
        _cats.sort(key=lambda k: k == "Ostatní")
        fb = '<button type="button" aria-pressed="true" data-cat="">Vše</button>' + "".join(f'<button type="button" aria-pressed="false" data-cat="{k}">{k}</button>' for k in _cats)
        c = intro + '<div class="filters" id="filters" role="group" aria-label="Filtr referencí">' + fb + '</div><div class="grid">' + "".join(f'<div class="tile" data-cat="{cat(x)}">{rimg(x, depth)}{x}</div>' for x in parts if x.strip()) + "</div>"
    if path == "o-nas":
        wide = " wide"
        intro = c.split("<p><strong>", 1)[0]; tail = re.sub(r"<[^>]+>", "", c.rsplit("</ul>", 1)[1]).strip()
        tiles = re.findall(r'<p><strong>(.*?)\s*–\s*</strong>\s*(.*?)</p>\s*<ul><li>(?:e-)?mail: (.*?)</li></ul>', c)
        c = intro + ('<h3>Náš tým</h3>' if intro.strip() else '') + '<div class="grid">' + "".join(f'<div class="tile"><h4>{n}</h4><p>{r}</p><p><a href="mailto:{e}">{e}</a></p></div>' for n, r, e in tiles) + '</div>' + (f'<p style="margin-top:32px">{tail}</p>' if tail else '')
    if path in ("produkty/prukaz-energeticke-narocnosti-budovy", "produkty-s-financni-podporou/system-epc"):
        n = [0]; items = []
        def hid(m):
            n[0] += 1; items.append((n[0], m.group(2))); return f'<h{m.group(1)} id="s{n[0]}">{m.group(2)}</h{m.group(1)}>'
        c = re.sub(r"<h([34])>(.*?)</h\1>", hid, c)
        TL = {"EPC METODIKA": "Metodika EPC", "Zákazník a firma EPC": "Typy dohod", "Smlouva se obvykle": "Typy smluv", "Postup při realizaci": "Postup realizace",
              "Souhrn EPC": "Souhrn EPC služeb", "DOHODA O POSKYTOVÁNÍ": "Dohoda o poskytování EPC služeb", "Dohoda o úsporách energie": "Obsah dohody"}
        toc = '<aside class="toc"><strong>Na této stránce</strong><ul>' + "".join(f'<li><a href="#s{i}">{next((v for k, v in TL.items() if t.startswith(k)), t)}</a></li>' for i, t in items) + '</ul></aside>'
        k = c.index("</p>") + 4 if c.startswith("<p>") else 0
        c = c[:k] + toc + c[k:]
    if path == "ekis_poradenstvi":
        c = f'<img class="ekis" src="{"../" * depth}assets/img/ekis-logo.png" alt="Logo EKIS" width="190" height="94">' + c
    if path == "kontakt":
        c = re.sub(r"<p>Mapa:.*?</p>", "", c, flags=re.S); info = c; c = ""; wide = " wide"
        act = "/mail.php" if HOST else "../" * depth + "mail.php"
        c = '<div class="kgrid"><div>' + info + '</div><div>' + f'''<h3 id="poptavka">Napište nám</h3>
<form class="cf" method="post" action="{act}">
<p><label for="cf-n">Jméno a příjmení *</label><input id="cf-n" name="name" required minlength="2" maxlength="100" autocomplete="name"></p>
<p><label for="cf-e">E-mail *</label><input id="cf-e" name="email" type="email" required maxlength="150" autocomplete="email"></p>
<p><label for="cf-t">Telefon</label><input id="cf-t" name="phone" type="tel" maxlength="40" autocomplete="tel"></p>
<p><label for="cf-m">Zpráva *</label><textarea id="cf-m" name="message" rows="6" required minlength="10" maxlength="5000"></textarea></p>
<p class="hp" aria-hidden="true"><label>Web <input name="website" tabindex="-1" autocomplete="off"></label></p>
<input type="hidden" name="t" value="">
<p class="chk"><input id="cf-c" name="consent" type="checkbox" value="1" required><label for="cf-c">Seznámil(a) jsem se se <a href="{url("zasady-ochrany-osobnich-udaju", depth)}">zásadami zpracování osobních údajů</a>. *</label></p>
<p><button class="btn" type="submit"><span>Odeslat zprávu</span><b>↗</b></button></p>
<p class="cf-msg" role="status" aria-live="polite"></p>
</form>''' + "</div></div>" + MAP
        if DEMO: c = re.sub(r'<h3 id="poptavka">Napište nám</h3>.*?</form>', '<h3 id="poptavka">Napište nám</h3><p>Kontaktní formulář je v ukázkové verzi vypnutý. Napište nám prosím na <a href="mailto:bres@bres.cz">bres@bres.cz</a>.</p>', c, flags=re.S)
    segs = path.split("/"); bc = f'<a href="{url("domu", depth)}">Domů</a>'
    for i in range(len(segs) - 1):
        q = "/".join(segs[:i + 1]); bc += f'<span>/</span><a href="{url(q, depth)}">{pages[q]["title"]}</a>' if q in pages else ""
    bc += f'<span>/</span>{p["title"]}'
    c = relevel(c)
    b_ = BAN.get(path)
    bn = f'<section class="ban has" style="--bi:url(img/{b_[0]}-l.webp);--bm:url(img/{b_[0]}-m.webp);--bp:{b_[1]}">' if b_ else '<section class="ban">'
    return f'{bn}<div class="wrap"><h1>{p["title"]}</h1><div class="bc">{bc}</div></div></section><main id="main" class="wrap"><article class="art{wide}">{fix_links(linkify(c), depth)}</article></main>'

shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT + "/assets/fonts")
for f in os.listdir("."):
    if f.endswith(".woff2") or f.startswith("LICENSE"): shutil.copy(f, OUT + "/assets/fonts/")
shutil.copytree("img", OUT + "/assets/img", ignore=None if (HOST or DEMO) else shutil.ignore_patterns("social")) if os.path.isdir("img") else None
if not DEMO: shutil.copy("mail.php", OUT)
if DEMO: open(OUT + "/.nojekyll", "w").close()
shutil.copy("style.css", OUT + "/assets/"); shutil.copy("app.js", OUT + "/assets/")
for path, p in pages.items():
    d = depth_of(path); body = '<main id="main">' + home(p) + '</main>' if path == "domu" else inner(p)
    txt = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", p["content"]))).strip()
    desc = (txt[:157].rsplit(" ", 1)[0] + "…") if len(txt) > 160 else (txt or p["title"] + " – BRES")
    if path == "domu": desc = "BRES – projekce TZB a energetických celků, realizace a provoz tepelných zdrojů. Brno."
    title = site["seo_title_home"] if path == "domu" else f'{p["title"]} | BRES.CZ'
    target = OUT + ("/index.html" if path == "domu" else f"/{path}/index.html")
    os.makedirs(os.path.dirname(target), exist_ok=True)
    open(target, "w", encoding="utf-8").write(shell(title, body, d, path, desc))
print(len(pages), "stránek ->", OUT)

if DEMO:
    open(OUT + "/robots.txt", "w").write("User-agent: *\nDisallow: /\n")
else:
    def lastmod(k):
        try:
            import subprocess
            f = pages[k].get("file")
            r = subprocess.run(["git", "log", "-1", "--format=%cs", "--", os.path.join("obsah", f)], cwd=ROOT, capture_output=True, text=True, timeout=10)
            return f"<lastmod>{r.stdout.strip()}</lastmod>" if f and r.returncode == 0 and r.stdout.strip() else ""
        except Exception: return ""
    loc = "".join(f"<url><loc>{BASE}/{'' if k == 'domu' else k + '/'}</loc>{lastmod(k)}</url>\n" for k in pages)
    open(OUT + "/sitemap.xml", "w", encoding="utf-8").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + loc + '</urlset>\n')
    open(OUT + "/robots.txt", "w").write("User-agent: *\nAllow: /\nSitemap: " + BASE + "/sitemap.xml\n")

if HOST:
    nf = shell("Stránka nenalezena | BRES.CZ", '<main id="main" class="wrap"><article class="art"><h1>Stránka nenalezena</h1><p>Tuto adresu jsme nenašli. Vraťte se na <a href="/">úvodní stranu</a> nebo použijte menu.</p></article></main>', 0, "404", "Stránka nenalezena").replace('"assets/', '"/assets/')
    open(OUT + "/404.html", "w", encoding="utf-8").write(nf)
    open(OUT + "/.htaccess", "w", encoding="utf-8").write("""ErrorDocument 404 /404.html
RewriteEngine On
# Staré adresy -> nové
RewriteRule ^standardni-produkty/(.*)$ /produkty/$1 [R=301,L]
# Po spuštění na ostré doméně odkomentujte (vynutí https a www):
# RewriteCond %{HTTPS} off [OR]
# RewriteCond %{HTTP_HOST} !^www\\. [NC]
# RewriteRule ^ https://www.bres.cz%{REQUEST_URI} [L,R=301]
<IfModule mod_headers.c>
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>
<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml
</IfModule>
<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType image/webp "access plus 1 month"
ExpiresByType image/png "access plus 1 month"
ExpiresByType font/woff2 "access plus 1 year"
ExpiresByType application/font-woff2 "access plus 1 year"
ExpiresByType text/css "access plus 1 week"
ExpiresByType application/javascript "access plus 1 week"
ExpiresByType text/html "access plus 10 minutes"
</IfModule>
""")

if DEMO:
    BP = opt("--base-path", "/")
    nf = shell("Stránka nenalezena | BRES.CZ", '<main id="main" class="wrap"><article class="art"><h1>Stránka nenalezena</h1><p>Tuto adresu jsme nenašli. Vraťte se na <a href="index.html">úvodní stranu</a> nebo použijte menu.</p></article></main>', 0, "404", "Stránka nenalezena")
    nf = re.sub(r'(href|src)="(?!https?:|mailto:|tel:|#|/|data:)([^"]+)"', lambda m: f'{m.group(1)}="{BP}{m.group(2)}"', nf)
    open(OUT + "/404.html", "w", encoding="utf-8").write(nf)

for w in sorted(set(WARN)): print("POZOR:", w)
