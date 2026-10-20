/* =========================================================
   Invitación de graduación · Sección 1: Entrada de gala
   ========================================================= */
(function () {
  "use strict";

  var raiz = document.documentElement;
  var entrada = document.getElementById("entrada");
  var invitacion = document.getElementById("invitacion");
  var portada = document.getElementById("portada");
  var boton = document.getElementById("abrir-invitacion");
  if (!entrada) return;
  if (invitacion) invitacion.setAttribute("inert", "");

  var SVG = "http://www.w3.org/2000/svg";

  /* ---------- Marco: imagen dividida en 5 × 5 zonas ----------
     Cortes en px de la imagen original (941 × 1672). Las columnas
     1 y 3 y las filas 1 y 3 sólo contienen líneas rectas y fondo,
     así que pueden estirarse sin deformar los ornamentos. */
  var CORTES_X = [0, 180, 275, 666, 761, 941];
  var CORTES_Y = [0, 330, 740, 830, 1265, 1672];
  var COLUMNAS = ["--c0", "--c1", "--c2", "--c1", "--c0"];
  var FILAS = ["--r0", "--r1", "--r2", "--r3", "--r4"];

  function construirMarco(marco) {
    var fragmento = document.createDocumentFragment();
    for (var f = 0; f < 5; f++) {
      for (var c = 0; c < 5; c++) {
        var zona = document.createElement("div");
        zona.className = "marco__zona";
        zona.style.setProperty("--w", "var(" + COLUMNAS[c] + ")");
        zona.style.setProperty("--h", "var(" + FILAS[f] + ")");
        zona.style.setProperty("--sx", CORTES_X[c]);
        zona.style.setProperty("--sy", CORTES_Y[f]);
        zona.style.setProperty("--sw", CORTES_X[c + 1] - CORTES_X[c]);
        zona.style.setProperty("--sh", CORTES_Y[f + 1] - CORTES_Y[f]);
        fragmento.appendChild(zona);
      }
    }
    marco.appendChild(fragmento);
  }

  /* ---------- Sello geométrico con birrete ---------- */
  function poligono(radio, lados, giro) {
    var puntos = [];
    for (var i = 0; i < lados; i++) {
      var a = (Math.PI * 2 * i) / lados + giro;
      puntos.push((radio * Math.cos(a)).toFixed(2) + "," + (radio * Math.sin(a)).toFixed(2));
    }
    return puntos.join(" ");
  }

  function rombo(x, y, r) {
    return (x) + "," + (y - r) + " " + (x + r) + "," + y + " " + x + "," + (y + r) + " " + (x - r) + "," + y;
  }

  function marcadoSello(id) {
    var rayos = "";
    // Abanico geométrico sobre el sello: rayos rectos, sin curvas
    for (var g = -168; g <= -12; g += 12) {
      var a = (g * Math.PI) / 180;
      var largo = (g / 12) % 2 === 0 ? 128 : 108;
      rayos += '<line x1="' + (84 * Math.cos(a)).toFixed(2) + '" y1="' + (84 * Math.sin(a)).toFixed(2) +
        '" x2="' + (largo * Math.cos(a)).toFixed(2) + '" y2="' + (largo * Math.sin(a)).toFixed(2) + '"/>';
    }
    var puntas = "";
    [-150, -90, -30].forEach(function (g) {
      var a = (g * Math.PI) / 180;
      puntas += '<polygon points="' + rombo(+(136 * Math.cos(a)).toFixed(2), +(136 * Math.sin(a)).toFixed(2), 3.2) + '"/>';
    });

    return (
      '<defs>' +
        '<radialGradient id="' + id + '-cuerpo" cx="50%" cy="38%" r="70%">' +
          '<stop offset="0" stop-color="#0d5a49"/>' +
          '<stop offset="1" stop-color="#062e25"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<g fill="none" stroke="currentColor" stroke-width=".7" opacity=".38">' + rayos + '</g>' +
      '<g fill="currentColor" opacity=".55">' + puntas + '</g>' +
      '<g fill="none" stroke="currentColor" stroke-linejoin="round">' +
        '<polygon points="' + poligono(80, 8, Math.PI / 8) + '" stroke-width=".6" opacity=".55"/>' +
        '<polygon points="' + poligono(72, 8, Math.PI / 8) + '" fill="url(#' + id + '-cuerpo)" stroke-width="1.4"/>' +
        '<polygon points="' + poligono(64, 8, Math.PI / 8) + '" stroke-width=".6" opacity=".8"/>' +
        '<circle r="51" stroke-width=".9"/>' +
        '<circle r="46" stroke-width=".5" stroke-dasharray="1.2 3.2" opacity=".85"/>' +
      '</g>' +
      '<g fill="currentColor">' +
        '<polygon points="' + rombo(0, -57.5, 2.6) + '"/>' +
        '<polygon points="' + rombo(0, 57.5, 2.6) + '"/>' +
        '<polygon points="' + rombo(-57.5, 0, 2.6) + '"/>' +
        '<polygon points="' + rombo(57.5, 0, 2.6) + '"/>' +
      '</g>' +
      // Birrete en líneas finas
      '<g transform="translate(0 -3) scale(1.12)" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round" stroke-linecap="round">' +
        '<path d="M-19 2 V15 L0 21 L19 15 V2"/>' +
        '<path d="M-19 15 L0 21 L19 15" opacity=".5" transform="translate(0 -4)"/>' +
        '<polygon points="0,-20 34,-6 0,8 -34,-6" fill="#0a4a3c"/>' +
        '<polygon points="0,-14.5 21,-6 0,2.5 -21,-6" stroke-width=".55" opacity=".7"/>' +
        '<path d="M0 -6 L25 1 V17"/>' +
        '<path d="M22.5 17 H27.5 L29 26 H21 Z" fill="currentColor" fill-opacity=".25"/>' +
        '<circle cx="0" cy="-6" r="1.7" fill="currentColor"/>' +
      '</g>'
    );
  }

  var marcos = entrada.querySelectorAll("[data-marco]");
  for (var i = 0; i < marcos.length; i++) construirMarco(marcos[i]);

  var sellos = entrada.querySelectorAll("[data-sello]");
  for (var j = 0; j < sellos.length; j++) {
    sellos[j].setAttribute("viewBox", "-160 -160 320 320");
    sellos[j].setAttribute("focusable", "false");
    sellos[j].innerHTML = marcadoSello("sello-" + j);
  }

  /* ---------- Partículas doradas en el haz de luz ---------- */
  function polvoDorado() {
    var lienzo = entrada.querySelector(".entrada__polvo");
    if (!lienzo || !lienzo.getContext) return;
    var ctx = lienzo.getContext("2d");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var ancho = lienzo.clientWidth;
    var alto = lienzo.clientHeight;
    lienzo.width = Math.round(ancho * dpr);
    lienzo.height = Math.round(alto * dpr);
    ctx.scale(dpr, dpr);

    var total = Math.round(Math.min(80, Math.max(34, (ancho * alto) / 12000)));
    var motas = [];
    for (var n = 0; n < total; n++) {
      // Más densas en el centro, donde se abre la luz
      var desvio = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      motas.push({
        x: ancho / 2 + desvio * ancho * 0.28,
        y: Math.random() * alto,
        r: 0.5 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 14,
        vy: -(12 + Math.random() * 34),
        fase: Math.random() * Math.PI * 2,
        ritmo: 2 + Math.random() * 4
      });
    }

    var previo = performance.now();
    var inicio = previo;
    function cuadro(ahora) {
      if (terminada) return;
      var dt = Math.min(0.05, (ahora - previo) / 1000);
      var t = (ahora - inicio) / 1000;
      previo = ahora;
      ctx.clearRect(0, 0, ancho, alto);
      ctx.globalCompositeOperation = "lighter";
      for (var m = 0; m < motas.length; m++) {
        var p = motas[m];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        var brillo = 0.25 + 0.6 * Math.abs(Math.sin(p.fase + t * p.ritmo));
        ctx.fillStyle = "rgba(255, 234, 196, " + (brillo * 0.8).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(216, 197, 165, " + (brillo * 0.12).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      window.requestAnimationFrame(cuadro);
    }
    window.requestAnimationFrame(cuadro);
  }

  /* ---------- Apertura ---------- */
  var abierta = false;
  var terminada = false;

  function finalizar() {
    if (terminada) return;
    terminada = true;
    entrada.parentNode.removeChild(entrada);
    raiz.classList.remove("entrada-activa");
    if (invitacion) invitacion.removeAttribute("inert");
    window.scrollTo(0, 0);
    if (portada) portada.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent("invitacion:abierta"));
  }

  function abrir() {
    if (abierta) return;
    abierta = true;
    boton.setAttribute("aria-disabled", "true");

    var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    entrada.addEventListener("animationend", function (e) {
      if (e.target === entrada && e.animationName === "entrada-salida") finalizar();
    });
    // Respaldo por si el navegador no emite animationend
    window.setTimeout(finalizar, reducido ? 900 : 2800);

    entrada.classList.add("is-abriendo");
    if (!reducido) polvoDorado();
    // La portada empieza a revelarse detrás de las puertas
    document.dispatchEvent(new CustomEvent("invitacion:abriendo", { detail: { reducido: reducido } }));
  }

  var disparadores = entrada.querySelectorAll("[data-abrir]");
  for (var k = 0; k < disparadores.length; k++) {
    disparadores[k].addEventListener("click", abrir);
  }
})();
