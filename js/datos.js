/* =========================================================
   Datos editables de la invitación
   Información de ejemplo: sustitúyela por la real.
   ========================================================= */
window.INVITACION = {
  // Portada
  nombre: "Valentina Ríos Montenegro",
  estudios: "Licenciatura en Arquitectura",
  generacion: "Generación 2022 – 2026",
  fecha: {
    // Fuente única para portada, cuenta regresiva y horario de la recepción.
    iso: "2026-12-12",
    hora: "20:30", // Hora local de la recepción, formato 24 h. Vacío = fecha pendiente.
    zonaHoraria: "America/Mexico_City" // Zona IANA del lugar; ajusta si el evento es en otra ciudad.
  },

  // Mensaje del graduado
  mensaje: {
    parrafos: [
      "Hoy celebro mucho más que el final de una etapa: celebro cada esfuerzo, cada aprendizaje y a quienes caminaron conmigo.",
      "Gracias por acompañarme, por creer en mí y por darme ánimo para seguir adelante. En este logro también están tu cariño y tu apoyo.",
      "Me hará muy feliz compartir contigo esta noche, recordar el camino recorrido y brindar por todo lo que está por venir."
    ],
    despedida: "Con cariño,",
    nombre: "Valentina",
    foto: {
      src: "", // Ejemplo de ruta propia: "img/graduado.webp". Vacío = espacio reservado.
      alt: "Fotografía del graduado",
      ajuste: "contain", // "contain" conserva toda la foto; "cover" llena el marco y recorta.
      posicion: "50% 50%" // Encuadre horizontal y vertical, por ejemplo "50% 30%".
    }
  },

  // Sección 5 · Cuándo y dónde (datos de ejemplo: cámbialos por los reales).
  // La recepción toma fecha, hora y zona horaria de `fecha` (arriba).
  // Si ambos eventos son en el mismo recinto, activa `compartenRecinto`.
  // En ese caso usa el lugar, dirección, foto y mapa de `ceremonia` (o de
  // `recepcion` si el recinto de la ceremonia sigue sin configurar).
  lugares: {
    compartenRecinto: false
  },
  anfitriones: "Ricardo Ríos Salazar y Mariana Montenegro de Ríos",
  ceremonia: {
    activo: true,
    lugar: "Auditorio Principal de la Facultad de Arquitectura",
    fecha: "2026-12-12", // AAAA-MM-DD, fecha local del evento.
    hora: "17:00", // HH:MM, formato 24 h, en la zona `fecha.zonaHoraria`.
    direccion: "Circuito Universitario 300, Coyoacán, 04510, Ciudad de México",
    direccionVerificada: true, // true permite buscar la dirección exacta en Google Maps.
    mapsUrl: "", // Enlace exacto de Google Maps, si lo tienes.
    foto: { src: "", alt: "", posicion: "50% 50%" }
  },
  recepcion: {
    activo: true,
    lugar: "Salón Esmeralda · Hacienda Los Laureles",
    direccion: "Camino Real a Tlalpan 1200, Tlalpan, 14000, Ciudad de México",
    direccionVerificada: true,
    mapsUrl: "",
    foto: { src: "", alt: "", posicion: "50% 50%" }
  },
  // Sección 6 · Programa. Cambia el orden de este arreglo para reordenar las
  // actividades; activo:false las oculta. La recepción usa `fecha.hora`.
  // Las demás horas se escriben HH:MM (24 h, horario del lugar). Si una
  // actividad ocurre después de medianoche, el programa lo detecta al pasar
  // de una hora tardía a una temprana; también puedes indicar diaSiguiente:true.
  programa: [
    { id: "recepcion", activo: true, icono: "puertas", titulo: "Recepción", descripcion: "Bienvenidos a una noche muy especial" },
    { id: "cena", activo: true, icono: "cubiertos", hora: "21:30", titulo: "Cena", descripcion: "Compartamos la mesa y celebremos este logro" },
    { id: "brindis", activo: true, icono: "copas", hora: "23:00", titulo: "Brindis", descripcion: "Por lo vivido y por todo lo que viene" },
    { id: "baile", activo: true, icono: "musica", hora: "23:30", titulo: "Baile", descripcion: "Es momento de celebrar en la pista" },
    { id: "cierre", activo: true, icono: "reloj", hora: "03:00", titulo: "Cierre de la celebración", descripcion: "Gracias por ser parte de este recuerdo" }
  ],
  // Sección 7 · Código de vestimenta. Todo el texto es editable.
  vestimenta: {
    antetitulo: "UNA OCASIÓN ESPECIAL",
    titulo: "Código de vestimenta",
    codigo: "Gala",
    frase: "Celebremos con el estilo que esta gran noche merece",
    // dibujo: "vestido" o "traje" (ilustración que acompaña a cada referencia)
    referencias: [
      { dibujo: "vestido", titulo: "Vestido largo", texto: "Una opción elegante para acompañarnos en esta celebración" },
      { dibujo: "traje", titulo: "Traje formal", texto: "Con camisa, corbata o moño y calzado de vestir" }
    ],
    // Colores reservados (opcional). Con la lista vacía el bloque no aparece.
    // Ejemplo: colores: [{ nombre: "Blanco", muestra: "#FFFFFF" }, { nombre: "Rojo", muestra: "#9B1B30" }],
    //          para: "la graduada"
    // `texto` reemplaza la frase automática si quieres redactarla tú.
    coloresReservados: {
      colores: [],
      para: "",
      texto: ""
    }
  },
  // Sección 8 · El camino hasta aquí. Las fotos de la galería se editan en la
  // lista `data-galeria-lista` de index.html. Aquí eliges las cuatro fotos que
  // aparecen dentro de las polaroid del fondo, en este orden:
  //   1 arriba, la de atrás · 2 arriba, la del frente
  //   3 abajo, la del frente · 4 abajo, la de atrás (junto a la cámara)
  // foto: ruta de la imagen. encuadre: punto que queda al centro del recorte
  // ("50% 50%" es el centro; "50% 30%" sube el encuadre).
  // Con la lista vacía se usan las primeras cuatro fotos de la galería;
  // una polaroid sin foto se queda vacía, como en el diseño original.
  galeria: {
    polaroids: [
      { foto: "img/recuerdos/01-birretes.jpg", encuadre: "45% 50%" },
      { foto: "img/recuerdos/03-grupo.jpg", encuadre: "50% 62%" },
      { foto: "img/recuerdos/07-ceremonia.jpg", encuadre: "50% 40%" },
      { foto: "img/recuerdos/05-estudio.jpg", encuadre: "60% 50%" }
    ]
  },
  // Sección 9 · Pase y confirmación de asistencia.
  // El pase toma el graduado de `nombre` y la fecha de `fecha` (arriba).
  // invitado: nombre del invitado o familia. lugares: lugares reservados en el
  // pase, contando al titular. Vacíos (o 0) no se muestran ni se inventan.
  // Para un pase personal, agrega los datos al enlace de cada invitado:
  //   index.html?invitado=Familia%20López&lugares=4
  // Los datos del enlace tienen prioridad sobre los de aquí.
  confirmacion: {
    antetitulo: "TU PRESENCIA HARÁ LA DIFERENCIA",
    titulo: "Celebra conmigo",
    frase: "Me encantará compartir esta noche contigo. Confirma tu asistencia para preparar cada detalle",
    pase: {
      evento: "GALA DE GRADUACIÓN",
      invitado: "",
      lugares: 0
    },
    fechaLimite: "28 de noviembre de 2026", // Vacío = no se muestra.
    // WhatsApp que recibe las respuestas, en formato internacional: código de
    // país y número, sin espacios ni signo +. Ejemplo: "5215512345678".
    // Vacío = el botón se desactiva y aparece «Confirmaciones disponibles próximamente».
    whatsapp: ""
  }
};

// La portada toma día, mes y año de la misma fecha ISO del contador.
(function () {
  var fecha = window.INVITACION.fecha;
  var partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha.iso || "");
  if (!partes) return;
  var valor = new Date(Date.UTC(+partes[1], +partes[2] - 1, +partes[3], 12));
  if (valor.getUTCFullYear() !== +partes[1] || valor.getUTCMonth() + 1 !== +partes[2] ||
      valor.getUTCDate() !== +partes[3]) return;
  fecha.dia = String(valor.getUTCDate());
  var mes = new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: "UTC" }).format(valor);
  fecha.mes = mes.charAt(0).toUpperCase() + mes.slice(1);
  fecha.anio = String(valor.getUTCFullYear());
})();
