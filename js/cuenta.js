/* =========================================================
   Sección 4 · Cuenta regresiva
   ========================================================= */
(function () {
  "use strict";

  var seccion = document.getElementById("cuenta-regresiva");
  if (!seccion) return;
  var fecha = (window.INVITACION || {}).fecha || {};
  var estado = seccion.querySelector("[data-cuenta-estado]");
  var marcadores = seccion.querySelector("[data-cuenta-marcadores]");
  var descripcion = seccion.querySelector("[data-cuenta-fecha]");
  var titulo = seccion.querySelector("[data-cuenta-titulo]") || seccion.querySelector("#cuenta-titulo");
  var frase = seccion.querySelector("[data-cuenta-frase]");
  var antetitulo = seccion.querySelector(".cuenta__antetitulo");
  var campos = ["dias", "horas", "minutos", "segundos"].map(function (unidad) {
    return seccion.querySelector("[data-cuenta-" + unidad + "]");
  });
  var reducido = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  // Convierte la hora de pared del evento a un instante UTC usando su zona IANA.
  // Comprueba de nuevo los componentes para rechazar fechas imposibles y horas
  // que no existan durante un cambio de horario de verano.
  function instanteEvento() {
    if (typeof fecha.iso !== "string" || typeof fecha.hora !== "string" ||
        typeof fecha.zonaHoraria !== "string" || !fecha.zonaHoraria.trim()) return null;
    var dia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha.iso);
    var hora = /^(\d{2}):(\d{2})$/.exec(fecha.hora);
    if (!dia || !hora) return null;
    var valores = [+dia[1], +dia[2], +dia[3], +hora[1], +hora[2]];
    if (valores[0] < 1000 || valores[3] > 23 || valores[4] > 59) return null;
    var pared = Date.UTC(valores[0], valores[1] - 1, valores[2], valores[3], valores[4]);
    var comprobacion = new Date(pared);
    if (comprobacion.getUTCFullYear() !== valores[0] ||
        comprobacion.getUTCMonth() + 1 !== valores[1] ||
        comprobacion.getUTCDate() !== valores[2]) return null;

    var formato;
    try {
      formato = new Intl.DateTimeFormat("en-US", {
        timeZone: fecha.zonaHoraria, year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
      });
    } catch (error) { return null; }

    function enZona(instante) {
      var partes = {};
      formato.formatToParts(new Date(instante)).forEach(function (parte) {
        if (parte.type !== "literal") partes[parte.type] = Number(parte.value);
      });
      return [partes.year, partes.month, partes.day, partes.hour, partes.minute, partes.second];
    }
    var instante = pared;
    for (var i = 0; i < 4; i++) {
      var partes = enZona(instante);
      var zonaComoUtc = Date.UTC(partes[0], partes[1] - 1, partes[2], partes[3], partes[4], partes[5]);
      instante += pared - zonaComoUtc;
    }
    var resultado = enZona(instante);
    if (resultado.slice(0, 5).some(function (valor, indice) { return valor !== valores[indice]; })) return null;
    return instante;
  }

  // Reinicia la animación de una cifra cuando cambia su valor
  function reanimar(elemento, clase) {
    elemento.classList.remove(clase);
    void elemento.offsetWidth;
    elemento.classList.add(clase);
  }

  var objetivo = instanteEvento();
  var intervalo;
  function terminar() {
    window.clearInterval(intervalo);
    marcadores.hidden = true;
    if (antetitulo) antetitulo.hidden = true;
    if (frase) frase.hidden = true;
    titulo.textContent = "¡Llegó el gran día!";
    estado.textContent = "Hoy celebramos el comienzo de una nueva etapa";
    estado.hidden = false;
  }

  if (objetivo !== null) {
    try {
      descripcion.textContent = "Cuenta regresiva para el " + new Intl.DateTimeFormat("es-MX", {
        timeZone: fecha.zonaHoraria, weekday: "long", day: "numeric", month: "long",
        year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
        timeZoneName: "long"
      }).format(new Date(objetivo)) + ".";
    } catch (error) {
      descripcion.textContent = "Cuenta regresiva para el " + fecha.iso + " a las " + fecha.hora +
        " en la zona horaria " + fecha.zonaHoraria + ".";
    }

    var primera = true;
    function actualizar() {
      var total = Math.max(0, Math.ceil((objetivo - Date.now()) / 1000));
      if (total === 0) { terminar(); return; }
      var cantidades = [
        Math.floor(total / 86400),
        Math.floor(total / 3600) % 24,
        Math.floor(total / 60) % 60,
        total % 60
      ];
      cantidades.forEach(function (cantidad, indice) {
        var texto = String(cantidad).padStart(2, "0");
        var campo = campos[indice];
        if (campo.textContent === texto) return;
        campo.textContent = texto;
        if (!primera && !reducido.matches) reanimar(campo, "is-cambio");
      });
      if (!primera && !reducido.matches) reanimar(campos[3].parentNode, "is-latido");
      var cifrasDias = String(cantidades[0]).length;
      campos[0].classList.toggle("cuenta__numero--larga", cifrasDias === 4);
      campos[0].classList.toggle("cuenta__numero--muy-larga", cifrasDias > 4);
      estado.hidden = true;
      marcadores.hidden = false;
      primera = false;
    }
    actualizar();
    if (objetivo > Date.now()) intervalo = window.setInterval(actualizar, 1000);
  }

  /* ---------- Confeti que cae por la sección ---------- */
  var lluvia = seccion.querySelector("[data-cuenta-lluvia]");
  if (lluvia && !reducido.matches) {
    var piezas = window.innerWidth < 700 ? 18 : 30;
    var fragmento = document.createDocumentFragment();
    for (var n = 0; n < piezas; n++) {
      var mota = document.createElement("i");
      var tam = 4 + Math.random() * 6;
      mota.style.cssText =
        "--l:" + (Math.random() * 100).toFixed(2) + "%;" +
        "--t0:" + (Math.random() * 92).toFixed(2) + "%;" +
        "--s:" + tam.toFixed(1) + "px;" +
        "--o:" + (0.35 + Math.random() * 0.45).toFixed(2) + ";" +
        "--dx:" + ((Math.random() - 0.5) * 80).toFixed(0) + "px;" +
        "--giro:" + (Math.random() < 0.5 ? -1 : 1) * (360 + Math.round(Math.random() * 540)) + "deg;" +
        "--dur:" + (9 + Math.random() * 9).toFixed(1) + "s;" +
        "--del:" + (-Math.random() * 18).toFixed(1) + "s";
      fragmento.appendChild(mota);
    }
    lluvia.appendChild(fragmento);
  }

  /* ---------- Revelado al entrar en pantalla y ambiente ---------- */
  // El contenido es visible en el CSS base si JavaScript o el observador fallan.
  if (!("IntersectionObserver" in window)) return;
  var enPantalla = false;
  function actualizarAmbiente() {
    seccion.classList.toggle("cuenta__animando", enPantalla && !document.hidden && !reducido.matches);
  }
  new IntersectionObserver(function (entradas) {
    enPantalla = entradas[0].isIntersecting;
    actualizarAmbiente();
  }).observe(seccion);
  document.addEventListener("visibilitychange", actualizarAmbiente);
  if (reducido.addEventListener) reducido.addEventListener("change", actualizarAmbiente);

  var bloques = seccion.querySelectorAll("[data-cuenta-revelar], [data-cuenta-escena]");
  var revelar = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("is-visible");
      revelar.unobserve(entrada.target);
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  for (var b = 0; b < bloques.length; b++) revelar.observe(bloques[b]);
  seccion.classList.add("is-observando");
})();
