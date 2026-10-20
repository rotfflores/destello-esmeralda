/* =========================================================
   Sección 7 · Código de vestimenta
   ========================================================= */
(function () {
  "use strict";

  var seccion = document.getElementById("codigo-vestimenta");
  if (!seccion) return;
  var datos = (window.INVITACION || {}).vestimenta;
  datos = datos && typeof datos === "object" ? datos : {};

  function texto(valor) {
    return typeof valor === "string" && valor.trim() ? valor.trim() : "";
  }

  /* ---------- Textos editables ---------- */
  ["antetitulo", "titulo", "codigo", "frase"].forEach(function (campo) {
    var valor = texto(datos[campo]);
    var nodo = seccion.querySelector('[data-vestimenta-campo="' + campo + '"]');
    if (nodo && valor) nodo.textContent = valor;
  });

  /* ---------- Referencias: usa las ilustraciones del HTML como plantilla ---------- */
  var lista = seccion.querySelector("[data-vestimenta-referencias]");
  if (Array.isArray(datos.referencias) && lista) {
    var plantillas = {};
    lista.querySelectorAll("[data-vestimenta-dibujo]").forEach(function (li) {
      plantillas[li.getAttribute("data-vestimenta-dibujo")] = li.querySelector(".vestimenta__dibujo");
    });
    var fragmento = document.createDocumentFragment();
    datos.referencias.forEach(function (ref) {
      if (!ref || (!texto(ref.titulo) && !texto(ref.texto))) return;
      var li = document.createElement("li");
      li.className = "vestimenta__referencia";
      li.setAttribute("data-vestimenta-revelar", "");
      var dibujo = plantillas[ref.dibujo];
      if (dibujo) li.appendChild(dibujo.cloneNode(true));
      if (texto(ref.titulo)) {
        var nombre = document.createElement("h3");
        nombre.className = "vestimenta__nombre";
        nombre.textContent = texto(ref.titulo);
        li.appendChild(nombre);
      }
      if (texto(ref.texto)) {
        var parrafo = document.createElement("p");
        parrafo.className = "vestimenta__texto";
        parrafo.textContent = texto(ref.texto);
        li.appendChild(parrafo);
      }
      fragmento.appendChild(li);
    });
    lista.replaceChildren(fragmento);
    lista.hidden = !lista.children.length;
    lista.classList.toggle("vestimenta__referencias--una", lista.children.length === 1);
  }

  /* ---------- Colores reservados: sólo si hay alguno configurado ---------- */
  var reserva = seccion.querySelector("[data-vestimenta-reserva]");
  var config = datos.coloresReservados || {};
  var colores = (Array.isArray(config.colores) ? config.colores : []).filter(function (color) {
    return color && texto(color.nombre);
  });
  if (reserva && colores.length) {
    var nombres = colores.map(function (color) { return texto(color.nombre).toLocaleLowerCase("es"); });
    var enumeracion = nombres.length > 1 ? nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1] : nombres[0];
    var para = texto(config.para);
    reserva.querySelector("[data-vestimenta-reserva-texto]").textContent = texto(config.texto) ||
      "Te pedimos reservar " + enumeracion + (para ? " para " + para : "") + ".";
    var muestras = reserva.querySelector("[data-vestimenta-muestras]");
    colores.forEach(function (color) {
      var item = document.createElement("li");
      var muestra = texto(color.muestra);
      if (muestra && window.CSS && CSS.supports && CSS.supports("color", muestra)) {
        var circulo = document.createElement("span");
        circulo.className = "vestimenta__muestra";
        circulo.setAttribute("aria-hidden", "true");
        circulo.style.setProperty("--muestra", muestra);
        item.appendChild(circulo);
      }
      item.appendChild(document.createTextNode(texto(color.nombre)));
      muestras.appendChild(item);
    });
    reserva.hidden = false;
    reserva.setAttribute("data-vestimenta-revelar", "");
  }

  var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Burbujas de champaña ---------- */
  var burbujas = seccion.querySelector("[data-vestimenta-burbujas]");
  if (burbujas && !reducido) {
    var total = window.innerWidth < 700 ? 12 : 20;
    for (var b = 0; b < total; b++) {
      var burbuja = document.createElement("i");
      var r = Math.random;
      burbuja.style.cssText = "--bx:" + (8 + r() * 84).toFixed(1) + "%;--by:" + (r() * 70).toFixed(1) + "%;" +
        "--bt:" + (3 + r() * 6).toFixed(1) + "px;--bo:" + (.25 + r() * .4).toFixed(2) + ";" +
        "--bdx:" + ((r() - .5) * 40).toFixed(0) + "px;--bdy:" + (120 + r() * 220).toFixed(0) + "px;" +
        "--bd:" + (8 + r() * 8).toFixed(1) + "s;--br:" + (-r() * 16).toFixed(1) + "s";
      burbujas.appendChild(burbuja);
    }
  }

  /* ---------- Revelado una sola vez y ambiente sólo en pantalla ---------- */
  // Sin IntersectionObserver o con movimiento reducido todo queda visible.
  if (!("IntersectionObserver" in window) || reducido) return;
  var enPantalla = false;
  function actualizarAmbiente() {
    seccion.classList.toggle("vestimenta__animando", enPantalla && !document.hidden);
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
  }, { rootMargin: "0px 0px -8% 0px", threshold: .15 });
  seccion.querySelectorAll("[data-vestimenta-revelar], [data-vestimenta-escena]").forEach(function (nodo) {
    revelar.observe(nodo);
  });
  seccion.classList.add("is-observando");
})();
