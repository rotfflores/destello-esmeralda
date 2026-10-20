(function () {
  "use strict";

  var seccion = document.getElementById("programa-noche");
  if (!seccion) return;
  var datos = window.INVITACION || {};
  var gala = datos.fecha || {};
  var lista = seccion.querySelector("[data-programa-lista]");
  var iconos = ["puertas", "cubiertos", "copas", "musica", "reloj"];

  function fechaValida(iso) {
    var partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!partes) return false;
    var valor = new Date(Date.UTC(+partes[1], +partes[2] - 1, +partes[3], 12));
    return valor.getUTCFullYear() === +partes[1] && valor.getUTCMonth() + 1 === +partes[2] && valor.getUTCDate() === +partes[3];
  }
  function horaValida(hora) {
    var partes = /^(\d{2}):(\d{2})$/.exec(hora || "");
    return !!partes && +partes[1] < 24 && +partes[2] < 60;
  }
  function zonaValida(zona) {
    if (typeof zona !== "string" || !zona.trim()) return false;
    try { new Intl.DateTimeFormat("es-MX", { timeZone: zona }).format(new Date()); return true; }
    catch (error) { return false; }
  }
  function texto(valor, reserva) {
    return typeof valor === "string" && valor.trim() ? valor.trim() : reserva;
  }
  function elemento(etiqueta, clase, contenido) {
    var nodo = document.createElement(etiqueta);
    nodo.className = clase;
    if (contenido) nodo.textContent = contenido;
    return nodo;
  }

  var zonaCorrecta = zonaValida(gala.zonaHoraria);
  var ultimoMinuto = null;
  var dia = 0;
  var horasConfiguradas = false;

  function actividad(item) {
    var li = elemento("li", "programa__actividad");
    li.setAttribute("data-programa-revelar", "");

    // Hora a la izquierda (arriba en celular)
    var tiempo = elemento("div", "programa__tiempo");
    var hora = item.id === "recepcion" && fechaValida(gala.iso) ? gala.hora : item.id === "recepcion" ? "" : item.hora;
    var parrafo = elemento("p", "programa__hora");
    var nota = "";
    if (zonaCorrecta && horaValida(hora)) {
      var minutos = +hora.slice(0, 2) * 60 + +hora.slice(3);
      if (item.diaSiguiente === true && dia === 0) dia = 1;
      else if (ultimoMinuto !== null && minutos < ultimoMinuto) dia += 1;
      ultimoMinuto = minutos;
      horasConfiguradas = true;
      parrafo.textContent = hora;
      parrafo.appendChild(elemento("span", "", " h"));
      nota = dia === 1 ? "Día siguiente" : dia > 1 ? dia + " días después" : "";
    } else {
      parrafo.textContent = "Por confirmar";
      parrafo.classList.add("programa__hora--pendiente");
    }
    tiempo.appendChild(parrafo);
    if (nota) tiempo.appendChild(elemento("span", "programa__nota", nota));
    li.appendChild(tiempo);

    // Medallón con el icono, sobre la línea de tiempo
    var medalla = elemento("span", "programa__medalla");
    medalla.setAttribute("aria-hidden", "true");
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "programa__icono");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#programa-icono-" + (iconos.includes(item.icono) ? item.icono : "rombo"));
    svg.appendChild(use);
    medalla.appendChild(svg);
    li.appendChild(medalla);

    var bloque = elemento("div", "programa__texto");
    bloque.appendChild(elemento("h3", "programa__nombre", texto(item.titulo, "[Actividad]")));
    var descripcion = texto(item.descripcion, "");
    if (descripcion) bloque.appendChild(elemento("p", "programa__descripcion", descripcion));
    li.appendChild(bloque);
    return li;
  }

  if (Array.isArray(datos.programa)) {
    var fragmento = document.createDocumentFragment();
    datos.programa.filter(function (item) { return item && item.activo !== false; }).forEach(function (item) {
      fragmento.appendChild(actividad(item));
    });
    lista.replaceChildren(fragmento);
    lista.hidden = !lista.children.length;
  }

  var zona = seccion.querySelector("[data-programa-zona]");
  zona.hidden = !horasConfiguradas;
  if (!zona.hidden) zona.textContent = "Horarios del lugar · " + gala.zonaHoraria;

  var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Polvo dorado en los rayos y notas que suben de la clave de sol ---------- */
  function azar(min, max) { return min + Math.random() * (max - min); }
  var polvo = seccion.querySelector("[data-programa-polvo]");
  if (polvo && !reducido) {
    for (var p = 0; p < 16; p++) {
      var mota = document.createElement("i");
      var t = Math.random();
      // Las motas se reparten dentro del abanico, cerca de la fuente de luz
      mota.style.cssText = "--px:" + (100 - t * azar(30, 75)).toFixed(1) + "%;--py:" + (t * azar(25, 70)).toFixed(1) + "%;" +
        "--pt:" + azar(1.5, 3.2).toFixed(1) + "px;--po:" + azar(.4, .9).toFixed(2) + ";" +
        "--pdx:" + azar(-30, -6).toFixed(0) + "px;--pdy:" + azar(10, 45).toFixed(0) + "px;" +
        "--pd:" + azar(6, 11).toFixed(1) + "s;--pr:" + (-azar(0, 11)).toFixed(1) + "s";
      polvo.appendChild(mota);
    }
  }
  var notas = seccion.querySelector("[data-programa-notas]");
  if (notas && !reducido) {
    var figuras = [
      '<svg viewBox="0 0 20 28"><path fill="currentColor" d="M13 1v18.5a4.5 3.6 -20 1 1-2-3V6.5l7 2.5V5Z"/></svg>',
      '<svg viewBox="0 0 30 28"><path fill="currentColor" d="M9 6l18-5v18a4.5 3.5 -20 1 1-2-3V7.5L11 11v12a4.5 3.5 -20 1 1-2-3Z"/></svg>'
    ];
    for (var n = 0; n < 6; n++) {
      var envoltura = document.createElement("span");
      envoltura.innerHTML = figuras[n % 2];
      var nota = envoltura.firstChild;
      nota.style.cssText = "--nx:" + azar(0, 70).toFixed(0) + "%;--nt:" + azar(14, 24).toFixed(0) + ";" +
        "--ndx:calc(" + azar(-110, -30).toFixed(0) + " * var(--k));--ng:" + azar(-25, 20).toFixed(0) + "deg;" +
        "--nd:" + azar(5.5, 8.5).toFixed(1) + "s;--nr:" + (n * 1.25 + azar(0, .6)).toFixed(2) + "s";
      notas.appendChild(nota);
    }
  }

  /* ---------- Revelado, ambiente y línea de luz ---------- */
  // El HTML y el CSS base quedan visibles si JavaScript no termina de cargar.
  if (!("IntersectionObserver" in window)) return;
  var actividades = lista.querySelectorAll(".programa__actividad");
  if (reducido) {
    lista.style.setProperty("--progreso", "1");
    actividades.forEach(function (li) { li.classList.add("is-activa"); });
    return;
  }

  var enPantalla = false;
  function actualizarAmbiente() {
    seccion.classList.toggle("programa__animando", enPantalla && !document.hidden);
  }
  new IntersectionObserver(function (entradas) {
    enPantalla = entradas[0].isIntersecting;
    actualizarAmbiente();
    if (enPantalla) pedirProgreso();
  }).observe(seccion);
  document.addEventListener("visibilitychange", actualizarAmbiente);

  var revelar = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("is-visible");
      revelar.unobserve(entrada.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: .15 });
  seccion.querySelectorAll("[data-programa-revelar], [data-programa-escena], .programa__remate").forEach(function (nodo) {
    revelar.observe(nodo);
  });

  // La línea se llena hasta la altura del 62 % de la pantalla y enciende cada medallón
  var pendiente = false;
  function progreso() {
    pendiente = false;
    var caja = lista.getBoundingClientRect();
    var foco = window.innerHeight * .62;
    var valor = Math.min(1, Math.max(0, (foco - caja.top - 40) / Math.max(1, caja.height - 80)));
    lista.style.setProperty("--progreso", valor.toFixed(4));
    actividades.forEach(function (li) {
      var medalla = li.querySelector(".programa__medalla").getBoundingClientRect();
      li.classList.toggle("is-activa", medalla.top + medalla.height / 2 <= foco);
    });
  }
  function pedirProgreso() {
    if (pendiente || !enPantalla) return;
    pendiente = true;
    window.requestAnimationFrame(progreso);
  }
  window.addEventListener("scroll", pedirProgreso, { passive: true });
  window.addEventListener("resize", pedirProgreso);
  seccion.classList.add("is-observando");
})();
