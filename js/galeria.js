(function () {
  "use strict";

  var seccion = document.getElementById("galeria-recuerdos");
  var visor = document.getElementById("galeria-visor");
  if (!seccion || !visor) return;

  var lista = seccion.querySelector("[data-galeria-lista]");
  var fotos = Array.from(lista.querySelectorAll(":scope > .galeria__item")).map(function (item) {
    var enlace = item.querySelector("a.galeria__archivo[href]");
    var imagen = enlace && enlace.querySelector("img[src]");
    var leyenda = item.querySelector("figcaption");
    if (!enlace || !imagen || !imagen.getAttribute("src") || !enlace.getAttribute("href")) {
      item.hidden = true;
      return null;
    }
    // El archivo sigue accesible como enlace si el visor no está disponible.
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
    imagen.loading = "lazy";
    imagen.decoding = "async";
    imagen.addEventListener("error", function () {
      item.hidden = true;
      if (!fotos.some(function (foto) { return foto && !foto.item.hidden; })) seccion.classList.remove("galeria--con-fotos");
    });
    return { item: item, enlace: enlace, imagen: imagen, leyenda: leyenda ? leyenda.textContent.trim() : "" };
  }).filter(Boolean);

  if (!fotos.length) return;
  seccion.classList.add("galeria--con-fotos");

  /* ---------- Fotos dentro de las polaroid del fondo ---------- */
  // Se eligen en datos.js (galeria.polaroids); con la lista vacía se usan
  // las primeras cuatro fotos de la galería. Sin foto, la polaroid queda vacía.
  var ajustes = (window.INVITACION && window.INVITACION.galeria) || {};
  var elegidas = (Array.isArray(ajustes.polaroids) ? ajustes.polaroids : []).filter(function (p) {
    return p && typeof p.foto === "string" && p.foto.trim();
  });
  if (!elegidas.length) {
    elegidas = fotos.slice(0, 4).map(function (foto) {
      return { foto: foto.imagen.getAttribute("src"), encuadre: foto.imagen.style.objectPosition };
    });
  }
  seccion.querySelectorAll("[data-galeria-polaroid]").forEach(function (img) {
    var elegida = elegidas[+img.getAttribute("data-galeria-polaroid") - 1];
    img.addEventListener("error", function () { img.hidden = true; });
    if (!elegida) { img.hidden = true; img.removeAttribute("src"); return; }
    img.hidden = false;
    if (img.getAttribute("src") !== elegida.foto.trim()) img.src = elegida.foto.trim();
    img.style.objectPosition = (elegida.encuadre || "50% 50%").trim();
  });

  // El botón se añade sólo cuando el visor funciona. Sin JS permanece el enlace.
  if (typeof visor.showModal === "function") {
    fotos.forEach(function (foto, indice) {
      var boton = document.createElement("button");
      boton.type = "button";
      boton.className = "galeria__abrir";
      boton.setAttribute("aria-label", "Abrir fotografía " + (indice + 1) + " de " + fotos.length + ": " + (foto.imagen.alt || foto.leyenda || "recuerdo"));
      boton.addEventListener("click", function () { abrir(indice, boton); });
      foto.enlace.tabIndex = -1;
      foto.enlace.setAttribute("aria-hidden", "true");
      var marco = document.createElement("div");
      marco.className = "galeria__marco";
      foto.enlace.before(marco);
      marco.appendChild(foto.enlace);
      marco.appendChild(boton);
    });
  }

  var imagenGrande = visor.querySelector("[data-galeria-imagen]");
  var leyendaGrande = visor.querySelector("[data-galeria-leyenda]");
  var posicion = visor.querySelector("[data-galeria-posicion]");
  var cerrarBoton = visor.querySelector("[data-galeria-cerrar]");
  var anteriorBoton = visor.querySelector("[data-galeria-anterior]");
  var siguienteBoton = visor.querySelector("[data-galeria-siguiente]");
  var actual = 0;
  var disparador = null;
  var overflowHtml = "";
  var overflowBody = "";

  function mostrar(indice) {
    actual = (indice + fotos.length) % fotos.length;
    var foto = fotos[actual];
    posicion.textContent = (actual + 1) + " de " + fotos.length;
    imagenGrande.hidden = false;
    imagenGrande.src = foto.enlace.href;
    imagenGrande.alt = foto.imagen.alt || foto.leyenda || "Fotografía del recuerdo";
    leyendaGrande.textContent = foto.leyenda;
    leyendaGrande.hidden = !foto.leyenda;
  }
  function abrir(indice, boton) {
    disparador = boton;
    overflowHtml = document.documentElement.style.overflow;
    overflowBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    mostrar(indice);
    visor.showModal();
    cerrarBoton.focus();
  }
  function cerrar() { if (visor.open) visor.close(); }
  visor.addEventListener("close", function () {
    document.documentElement.style.overflow = overflowHtml;
    document.body.style.overflow = overflowBody;
    imagenGrande.removeAttribute("src");
    imagenGrande.hidden = true;
    if (disparador && disparador.isConnected) disparador.focus();
    disparador = null;
  });
  visor.addEventListener("cancel", function (evento) { evento.preventDefault(); cerrar(); });
  cerrarBoton.addEventListener("click", cerrar);
  anteriorBoton.addEventListener("click", function () { mostrar(actual - 1); });
  siguienteBoton.addEventListener("click", function () { mostrar(actual + 1); });
  visor.addEventListener("keydown", function (evento) {
    if (evento.key === "ArrowLeft") { evento.preventDefault(); mostrar(actual - 1); }
    else if (evento.key === "ArrowRight") { evento.preventDefault(); mostrar(actual + 1); }
    else if (evento.key === "Escape") { evento.preventDefault(); cerrar(); }
    else if (evento.key === "Tab") {
      var controles = [cerrarBoton, anteriorBoton, siguienteBoton];
      var indice = controles.indexOf(document.activeElement);
      if (evento.shiftKey && indice <= 0) { evento.preventDefault(); controles[controles.length - 1].focus(); }
      else if (!evento.shiftKey && (indice === controles.length - 1 || indice === -1)) { evento.preventDefault(); controles[0].focus(); }
    }
  });
  var inicio = null;
  visor.querySelector(".galeria__visor-figura").addEventListener("touchstart", function (evento) {
    if (evento.touches.length === 1) inicio = { x: evento.touches[0].clientX, y: evento.touches[0].clientY };
  }, { passive: true });
  visor.querySelector(".galeria__visor-figura").addEventListener("touchend", function (evento) {
    if (!inicio || !evento.changedTouches.length) return;
    var dx = evento.changedTouches[0].clientX - inicio.x;
    var dy = evento.changedTouches[0].clientY - inicio.y;
    inicio = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) mostrar(actual + (dx < 0 ? 1 : -1));
  }, { passive: true });

  var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Polvo de luz ---------- */
  var polvo = seccion.querySelector("[data-galeria-polvo]");
  if (polvo && !reducido) {
    var total = window.innerWidth < 700 ? 14 : 24;
    for (var n = 0; n < total; n++) {
      var mota = document.createElement("i");
      var r = Math.random;
      mota.style.cssText = "--px:" + (4 + r() * 92).toFixed(1) + "%;--py:" + (10 + r() * 85).toFixed(1) + "%;" +
        "--pt:" + (2 + r() * 4).toFixed(1) + "px;--po:" + (.3 + r() * .5).toFixed(2) + ";" +
        "--pdx:" + ((r() - .5) * 70).toFixed(0) + "px;--pdy:" + (60 + r() * 140).toFixed(0) + "px;" +
        "--pd:" + (9 + r() * 9).toFixed(1) + "s;--pr:" + (-r() * 18).toFixed(1) + "s";
      polvo.appendChild(mota);
    }
  }

  /* ---------- Revelado una sola vez y ambiente sólo en pantalla ---------- */
  // Sin IntersectionObserver o con movimiento reducido todo queda visible.
  if (!("IntersectionObserver" in window) || reducido) return;
  var enPantalla = false;
  function actualizarAmbiente() {
    seccion.classList.toggle("galeria__animando", enPantalla && !document.hidden);
  }
  new IntersectionObserver(function (entradas) {
    enPantalla = entradas[0].isIntersecting;
    actualizarAmbiente();
  }).observe(seccion);
  document.addEventListener("visibilitychange", actualizarAmbiente);

  var revelar = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("is-visible");
      revelar.unobserve(entrada.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: .12 });
  fotos.forEach(function (foto, indice) {
    foto.item.style.setProperty("--retraso", (indice % 3) * .14 + "s");
  });
  seccion.querySelectorAll("[data-galeria-revelar], [data-galeria-escena], .galeria__item, .galeria__remate, .galeria__creditos").forEach(function (nodo) {
    revelar.observe(nodo);
  });
  seccion.classList.add("is-observando");
})();
