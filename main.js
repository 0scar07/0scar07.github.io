/* Oscar Llanos — Portafolio · main.js
   Script clásico (IIFE). Todo el contenido está en el HTML; esto solo añade movimiento. */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { if (window.console) console.warn("[" + name + "]", e); }
  }

  /* ---------- Fondo vivo: campo de puntos reactivo ---------- */
  function initField() {
    var canvas = $("#field");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var aurora = $(".bg__aurora");
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    var W = 0, H = 0, gap = 26, pts = [];
    var mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
    var ripples = [];
    var t0 = performance.now(), running = true, raf = 0;
    var speed = reduced ? 0.25 : 1;

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      gap = W < 640 ? 24 : 26;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = [];
      var ox = (W % gap) / 2, oy = (H % gap) / 2;
      for (var y = oy; y <= H; y += gap) for (var x = ox; x <= W; x += gap) pts.push(x, y);
    }

    function frame(now) {
      raf = 0;
      if (!running) return;
      var t = (now - t0) / 1000 * speed;
      mouse.x += (mouse.tx - mouse.x) * 0.14;
      mouse.y += (mouse.ty - mouse.y) * 0.14;
      ctx.clearRect(0, 0, W, H);

      var R = Math.min(220, Math.max(140, W * 0.14)), R2 = R * R;
      var mx = mouse.x, my = mouse.y;
      for (var r = ripples.length - 1; r >= 0; r--) { ripples[r].r += 9; ripples[r].a *= 0.965; if (ripples[r].a < 0.02) ripples.splice(r, 1); }

      for (var i = 0; i < pts.length; i += 2) {
        var x = pts[i], y = pts[i + 1];
        // ola de fondo
        var w = Math.sin(x * 0.011 + t * 0.7) * Math.cos(y * 0.013 - t * 0.5) + Math.sin((x + y) * 0.005 - t * 0.35);
        var a = 0.07 + Math.max(0, w) * 0.09;
        var s = 1.1;
        var dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
        var hue = 0; // 0 violeta → 1 hielo
        if (d2 < R2) {
          var d = Math.sqrt(d2) || 1, f = 1 - d / R, ff = f * f;
          x += dx / d * ff * 16; y += dy / d * ff * 16;
          a += ff * 0.85; s += ff * 1.9;
          hue = Math.max(0, Math.min(1, (dx / R + 1) / 2));
        }
        for (var k = 0; k < ripples.length; k++) {
          var rp = ripples[k], rx = pts[i] - rp.x, ry = pts[i + 1] - rp.y;
          var dd = Math.abs(Math.sqrt(rx * rx + ry * ry) - rp.r);
          if (dd < 34) { var g = (1 - dd / 34) * rp.a; a += g * 0.9; s += g * 1.4; hue = Math.max(hue, g); }
        }
        if (a > 1) a = 1;
        var cr = 155 + (127 - 155) * hue, cg = 135 + (231 - 135) * hue, cb = 255 + (242 - 255) * hue;
        ctx.fillStyle = "rgba(" + (cr | 0) + "," + (cg | 0) + "," + (cb | 0) + "," + a.toFixed(3) + ")";
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
      raf = requestAnimationFrame(frame);
    }

    function start() { if (!raf && running) raf = requestAnimationFrame(frame); }

    function move(e) {
      mouse.tx = e.clientX; mouse.ty = e.clientY;
      if (!mouse.active) { mouse.x = mouse.tx; mouse.y = mouse.ty; mouse.active = true; }
      if (aurora) {
        aurora.style.setProperty("--mx", (e.clientX / W * 100).toFixed(1) + "%");
        aurora.style.setProperty("--my", (e.clientY / H * 100).toFixed(1) + "%");
      }
    }
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", function () { mouse.tx = mouse.ty = -9999; mouse.active = false; });
    window.addEventListener("pointerdown", function (e) {
      if (reduced) return;
      ripples.push({ x: e.clientX, y: e.clientY, r: 0, a: 1 });
      if (ripples.length > 4) ripples.shift();
    }, { passive: true });

    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 120); });
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) start();
    });
    resize();
    start();
  }

  /* ---------- Nav: fondo al hacer scroll, progreso, sección activa, menú móvil ---------- */
  function initNav() {
    var nav = $("#nav"), bar = $("#progress");
    var ticking = false;
    function onScroll() {
      ticking = false;
      var y = window.scrollY || document.documentElement.scrollTop;
      nav.classList.toggle("is-scrolled", y > 24);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.setProperty("--sp", max > 0 ? (y / max).toFixed(4) : 0);
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();

    var toggle = $("#navToggle"), menu = $("#mobileMenu");
    function close() { toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Abrir menú"); menu.hidden = true; }
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      menu.hidden = !open;
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { close(); toggle.focus(); } });

    if ("IntersectionObserver" in window) {
      var links = $$(".nav__links a");
      var map = {};
      links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && map[en.target.id]) {
            links.forEach(function (l) { l.classList.remove("is-active"); });
            map[en.target.id].classList.add("is-active");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
    }
  }

  /* ---------- Nombre del hero: entrada palabra por palabra ---------- */
  function initSplit() {
    var h = $("[data-split]");
    if (!h) return;
    h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
    var i = 0;
    function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
            var inner = document.createElement("span"); inner.textContent = part;
            inner.style.setProperty("--d", (0.1 + i++ * 0.09) + "s");
            w.appendChild(inner); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) { wrap(n); }
      });
    }
    wrap(h);
    h.classList.add("is-split");
    requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add("in"); }); });
  }

  /* ---------- Revelado al hacer scroll (con red de seguridad) ---------- */
  function initReveals() {
    var els = $$(".reveal");
    // escalonado dentro de cada grupo
    var groups = new Map();
    els.forEach(function (el) {
      var p = el.parentElement, n = groups.get(p) || 0;
      el.style.setProperty("--d", Math.min(n * 0.07, 0.35) + "s");
      groups.set(p, n + 1);
    });
    function show(el) { el.classList.add("in"); }
    if (!("IntersectionObserver" in window)) { els.forEach(show); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
    // Red de seguridad: lo que ya está en pantalla se muestra aunque el observer falle
    setTimeout(function () {
      els.forEach(function (el) { if (!el.classList.contains("in") && el.getBoundingClientRect().top < window.innerHeight) show(el); });
    }, 1800);
  }

  /* ---------- Contadores ---------- */
  function initCounters() {
    var nums = $$("[data-count]");
    if (!nums.length || !("IntersectionObserver" in window)) return;
    nums.forEach(function (n) { n.textContent = "0"; });
    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      if (reduced) { el.textContent = target; return; }
      var t0 = performance.now(), dur = 1300;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * e);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.05 });
    nums.forEach(function (n) { io.observe(n); });
    setTimeout(function () { nums.forEach(function (n) { if (n.textContent === "0" && n.getBoundingClientRect().top < innerHeight) run(n); }); }, 2500);
  }

  /* ---------- Spotlight que sigue al cursor ---------- */
  function initSpotlight() {
    if (!finePointer) return;
    $$(".spot").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--x", (e.clientX - r.left) + "px");
        el.style.setProperty("--y", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Botones magnéticos ---------- */
  function initMagnetic() {
    if (!finePointer || reduced) return;
    $$(".magnetic").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22, y = (e.clientY - r.top - r.height / 2) * 0.3;
        b.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---------- Inclinación 3D (monograma, teléfonos, navegadores) ---------- */
  function initTilt() {
    if (!finePointer || reduced) return;
    $$(".tilt").forEach(function (el) {
      var max = el.id === "mono" ? 12 : 6;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(1000px) rotateY(" + (px * max).toFixed(2) + "deg) rotateX(" + (-py * max).toFixed(2) + "deg)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Línea de tiempo: progreso con el scroll ---------- */
  function initTimeline() {
    var tl = $("#timeline");
    if (!tl) return;
    var items = $$(".tl", tl), ticking = false;
    function update() {
      ticking = false;
      var r = tl.getBoundingClientRect(), vh = window.innerHeight, mark = vh * 0.62;
      var p = (mark - r.top) / r.height;
      tl.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(4));
      items.forEach(function (it) { it.classList.toggle("is-on", it.getBoundingClientRect().top + 30 < mark); });
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Carrusel de capturas ---------- */
  function initReel() {
    var track = $(".reel__track");
    if (!track) return;
    $$("[data-reel]").forEach(function (b) {
      b.addEventListener("click", function () {
        var dir = parseInt(b.getAttribute("data-reel"), 10);
        var li = track.querySelector("li");
        var step = li ? li.getBoundingClientRect().width + 18 : 200;
        track.scrollBy({ left: dir * step * 2, behavior: reduced ? "auto" : "smooth" });
      });
    });
  }

  /* ---------- Lightbox de capturas ---------- */
  function initLightbox() {
    var dlg = $("#lightbox");
    if (!dlg || typeof dlg.showModal !== "function") return;
    var img = $("#lbImg"), cap = $("#lbCap");
    $$("[data-lightbox]").forEach(function (im) {
      im.setAttribute("tabindex", "0");
      im.setAttribute("role", "button");
      function open() {
        img.src = im.currentSrc || im.src; img.alt = im.alt; cap.textContent = im.alt;
        dlg.showModal();
      }
      im.addEventListener("click", open);
      im.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    $("#lbClose").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- Copiar correo ---------- */
  function initCopy() {
    var b = $("#copyMail"), out = $("#copied");
    if (!b) return;
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-copy");
      function done() {
        out.textContent = "Correo copiado";
        b.querySelector("use").setAttribute("href", "#u-check");
        setTimeout(function () { out.textContent = ""; b.querySelector("use").setAttribute("href", "#u-copy"); }, 2200);
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(v).then(done, function () {});
      else {
        var ta = document.createElement("textarea"); ta.value = v; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (_) {}
        document.body.removeChild(ta);
      }
    });
  }

  function boot() {
    safe(initSplit, "split");
    safe(initNav, "nav");
    safe(initReveals, "reveals");
    safe(initCounters, "counters");
    safe(initField, "field");
    safe(initSpotlight, "spotlight");
    safe(initMagnetic, "magnetic");
    safe(initTilt, "tilt");
    safe(initTimeline, "timeline");
    safe(initReel, "reel");
    safe(initLightbox, "lightbox");
    safe(initCopy, "copy");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
