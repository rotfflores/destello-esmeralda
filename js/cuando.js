(function () {
  "use strict";

  var seccion = document.getElementById("cuando-donde");
  if (!seccion) return;
  var datos = window.INVITACION || {};
  var ceremonia = datos.ceremonia || {};
  var recepcion = datos.recepcion || {};
  var gala = datos.fecha || {};
  var tarjetas = seccion.querySelector("[data-cuando-tarjetas]");
  var elementos = {
    ceremonia: seccion.querySelector('[data-cuando-evento="ceremonia"]'),
    recepcion: seccion.querySelector('[data-cuando-evento="recepcion"]'),
    compartido: seccion.querySelector('[data-cuando-evento="compartido"]')
  };

  function texto(valor, reserva) {
    return typeof valor === "string" && valor.trim() && !/^\[.*\]$/.test(valor.trim()) ? valor.trim() : reserva;
  }
  function campo(tarjeta, nombre, valor) {
    var nodo = tarjeta.querySelector('[data-cuando-campo="' + nombre + '"]');
    if (nodo) nodo.textContent = valor;
  }
  function fechaValida(iso) {
    var partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!partes) return null;
    var fecha = new Date(Date.UTC(+partes[1], +partes[2] - 1, +partes[3], 12));
    return fecha.getUTCFullYear() === +partes[1] && fecha.getUTCMonth() + 1 === +partes[2] &&
      fecha.getUTCDate() === +partes[3] ? fecha : null;
  }
  function horaValida(hora) {
    var partes = /^(\d{2}):(\d{2})$/.exec(hora || "");
    return !!partes && +partes[1] < 24 && +partes[2] < 60;
  }
  function zonaValida(zona) {
    try { new Intl.DateTimeFormat("es-MX", { timeZone: zona }).format(new Date()); return true; }
    catch (error) { return false; }
  }
  function mostrarFecha(iso, reserva) {
    var valor = fechaValida(iso);
    return valor ? new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(valor) : reserva;
  }
  function mostrarHora(hora, reserva) { return horaValida(hora) ? hora + " h" : reserva; }
  function enlaceMaps(evento) {
    var exacto = typeof evento.mapsUrl === "string" ? evento.mapsUrl.trim() : "";
    if (exacto) {
      try {
        var url = new URL(exacto);
        var host = url.hostname.toLowerCase();
        var googleMaps = /^(?:www\.|maps\.)?google\.[a-z]{2,3}(?:\.[a-z]{2})?$/.test(host) &&
          (host.startsWith("maps.") || url.pathname === "/maps" || url.pathname.startsWith("/maps/"));
        if (url.protocol === "https:" && (host === "maps.app.goo.gl" ||
            host === "goo.gl" && url.pathname.startsWith("/maps/") || googleMaps)) return exacto;
      } catch (error) { /* Enlace sin configurar o inválido. */ }
      return "";
    }
    var direccion = texto(evento.direccion, "");
    return evento.direccionVerificada === true && direccion ?
      "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(direccion) : "";
  }
  function prepararFoto(tarjeta, evento, descripcion) {
    var figura = tarjeta.querySelector("[data-cuando-foto]");
    var imagen = figura.querySelector("img");
    var foto = evento.foto || {};
    figura.hidden = true;
    imagen.removeAttribute("src");
    if (typeof foto.src !== "string" || !foto.src.trim()) return;
    imagen.alt = texto(foto.alt, descripcion);
    imagen.style.objectPosition = texto(foto.posicion, "50% 50%");
    imagen.onload = function () { figura.hidden = false; };
    imagen.onerror = function () { figura.hidden = true; };
    imagen.src = foto.src.trim();
  }
  function prepararMapa(tarjeta, evento) {
    var enlace = tarjeta.querySelector("[data-cuando-mapa]");
    var url = enlaceMaps(evento);
    enlace.hidden = !url;
    if (url) enlace.href = url;
    else enlace.removeAttribute("href");
  }

  var zonaCorrecta = typeof gala.zonaHoraria === "string" && zonaValida(gala.zonaHoraria);
  var galaConfirmada = fechaValida(gala.iso) && horaValida(gala.hora) && zonaCorrecta;
  var fechaGala = galaConfirmada ? mostrarFecha(gala.iso, "") : "[Fecha de la celebración]";
  var horaGala = galaConfirmada ? mostrarHora(gala.hora, "") : "[Hora de recepción]";
  var fechaCeremonia = mostrarFecha(ceremonia.fecha, "[Fecha de la ceremonia]");
  var horaCeremonia = mostrarHora(ceremonia.hora, "[Hora de la ceremonia]");
  var activaCeremonia = ceremonia.activo !== false;
  var activaRecepcion = recepcion.activo !== false;
  var compartido = activaCeremonia && activaRecepcion && !!(datos.lugares || {}).compartenRecinto;

  elementos.ceremonia.hidden = !activaCeremonia || compartido;
  elementos.recepcion.hidden = !activaRecepcion || compartido;
  elementos.compartido.hidden = !compartido;
  tarjetas.classList.toggle("cuando__tarjetas--una", compartido || activaCeremonia !== activaRecepcion);

  if (activaCeremonia && !compartido) {
    campo(elementos.ceremonia, "lugar", texto(ceremonia.lugar, "[Nombre de la institución o recinto]"));
    campo(elementos.ceremonia, "fecha", fechaCeremonia);
    campo(elementos.ceremonia, "hora", horaCeremonia);
    campo(elementos.ceremonia, "direccion", texto(ceremonia.direccion, "[Dirección completa]"));
    prepararFoto(elementos.ceremonia, ceremonia, "Fotografía del recinto de la ceremonia");
    prepararMapa(elementos.ceremonia, ceremonia);
  }
  if (activaRecepcion && !compartido) {
    campo(elementos.recepcion, "lugar", texto(recepcion.lugar, "[Nombre del salón o recinto]"));
    campo(elementos.recepcion, "fecha", fechaGala);
    campo(elementos.recepcion, "hora", horaGala);
    campo(elementos.recepcion, "direccion", texto(recepcion.direccion, "[Dirección completa]"));
    prepararFoto(elementos.recepcion, recepcion, "Fotografía del recinto de la recepción");
    prepararMapa(elementos.recepcion, recepcion);
  }
  if (compartido) {
    // La marca de recinto compartido evita repetir fotografía y dirección.
    // Toma todos los datos del mismo recinto para que dirección y enlace coincidan.
    var principal = texto(ceremonia.lugar, "") || texto(ceremonia.direccion, "") ? ceremonia : recepcion;
    var comun = {
      lugar: texto(principal.lugar, "[Nombre del recinto]"),
      direccion: texto(principal.direccion, ""),
      direccionVerificada: principal.direccionVerificada === true,
      mapsUrl: texto(principal.mapsUrl, ""),
      foto: principal.foto
    };
    campo(elementos.compartido, "lugar", comun.lugar);
    campo(elementos.compartido, "ceremonia-fecha", fechaCeremonia);
    campo(elementos.compartido, "ceremonia-hora", horaCeremonia);
    campo(elementos.compartido, "recepcion-fecha", fechaGala);
    campo(elementos.compartido, "recepcion-hora", horaGala);
    campo(elementos.compartido, "direccion", texto(comun.direccion, "[Dirección completa]"));
    prepararFoto(elementos.compartido, comun, "Fotografía del recinto de la celebración");
    prepararMapa(elementos.compartido, comun);
  }

  var zona = seccion.querySelector("[data-cuando-zona]");
  zona.hidden = !zonaCorrecta || !(horaValida(ceremonia.hora) && activaCeremonia || galaConfirmada && activaRecepcion);
  if (!zona.hidden) zona.textContent = "Horarios del lugar · " + gala.zonaHoraria;

  // Sólo añadimos la clase al entrar: el estado base sigue visible si falla JavaScript.
  if (seccion.dataset.cuandoObservado || !("IntersectionObserver" in window)) return;
  seccion.dataset.cuandoObservado = "true";
  var reducida = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducida) return;
  var observar = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("cuando__revelado");
      observar.unobserve(entrada.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: .1 });
  seccion.querySelectorAll("[data-cuando-revelar]").forEach(function (elemento) {
    if (!elemento.hidden) observar.observe(elemento);
  });
  seccion.classList.add("is-observando");
})();
