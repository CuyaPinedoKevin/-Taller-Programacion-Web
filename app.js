const API_BASE = window.location.port === "3000" ? "" : "http://localhost:3000";

const productosBase = [
  { id: "combo-ensaladas", nombre: "Combo de ensaladas", precio: 10.00, categoria: "saludable", descuento: "-44%", imagen: "ensalada.png" },
  { id: "sandwiches", nombre: "Pack de sandwiches", precio: 8.50, categoria: "sandwiches", descuento: "-43%", imagen: "sandwiches.png" },
  { id: "postres", nombre: "Postres variados", precio: 6.00, categoria: "postres", descuento: "-50%", imagen: "postres.jpg" },
  { id: "plato-casero", nombre: "Plato casero", precio: 11.00, categoria: "casero", descuento: "-45%", imagen: "plato-casero.jpg" }
];

const imagenes = {
  "Combo de ensaladas": "ensalada.png",
  "Pack de sandwiches": "sandwiches.png",
  "Postres variados": "postres.jpg",
  "Plato casero": "plato-casero.jpg"
};

let productos = productosBase;

function obtenerPedidosLocales() {
  return JSON.parse(localStorage.getItem("pedidosLocales") || "[]");
}

function guardarPedidoLocal(pedido) {
  const pedidos = obtenerPedidosLocales();
  const ultimoId = pedidos.reduce((maximo, item) => Math.max(maximo, Number(item.id_pedido) || 0), 0);
  const pedidoGuardado = {
    id_pedido: ultimoId + 1,
    estado: "Registrado",
    ...pedido
  };

  pedidos.unshift(pedidoGuardado);
  localStorage.setItem("pedidosLocales", JSON.stringify(pedidos));
  return pedidoGuardado;
}

function limpiarPedidosLocales() {
  localStorage.removeItem("pedidosLocales");
}

async function obtenerJSON(url, opciones) {
  let respuesta;

  try {
    respuesta = await fetch(url, opciones);
  } catch (error) {
    throw new Error("No se pudo conectar con el servidor. Ejecuta server.js y abre http://localhost:3000");
  }

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "No se pudo conectar con el servidor");
  }

  return datos;
}

async function cargarProductos() {
  try {
    const datos = await obtenerJSON(API_BASE + "/productos");

    productos = datos.map((producto) => ({
      id: obtenerIdProducto(producto.nombre),
      nombre: producto.nombre,
      precio: Number(producto.precio),
      categoria: producto.categoria,
      descuento: producto.descuento,
      imagen: imagenes[producto.nombre]
    }));
  } catch (error) {
    console.log("Usando productos locales:", error.message);
    productos = productosBase;
  }
}

function obtenerIdProducto(nombre) {
  const producto = productosBase.find((item) => item.nombre === nombre);
  return producto ? producto.id : "";
}

function buscarProducto(id) {
  return productos.find((producto) => producto.id === id);
}

function mostrarMensaje(id, texto, tipo) {
  const mensaje = document.getElementById(id);
  if (!mensaje) return;

  mensaje.textContent = texto;
  mensaje.className = "mensaje " + tipo;
}

function marcarCampo(campo, valido) {
  if (campo) {
    campo.classList.toggle("campo-error", !valido);
  }
}

function toggleMenu() {
  document.getElementById("menu-principal")?.classList.toggle("abierto");
}

function iniciarInicio() {
  const saludo = document.getElementById("saludo-usuario");
  const contador = document.getElementById("contador-rescate");
  const boton = document.getElementById("actualizar-resumen");
  if (!saludo || !contador || !boton) return;

  async function actualizarResumen() {
    const usuario = sessionStorage.getItem("usuarioActivo");
    saludo.textContent = usuario
      ? "Bienvenido, " + usuario + ". Puedes revisar ofertas y registrar un nuevo pedido."
      : "Bienvenido. Inicia sesion o revisa las comidas disponibles del dia.";

    try {
      const pedidos = await obtenerJSON(API_BASE + "/pedidos");
      contador.textContent = "Pedidos registrados: " + pedidos.length;
    } catch (error) {
      contador.textContent = "Pedidos registrados: " + obtenerPedidosLocales().length;
    }
  }

  boton.addEventListener("click", actualizarResumen);
  actualizarResumen();
}

function iniciarLogin() {
  const formulario = document.getElementById("form-login");
  if (!formulario) return;

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const correo = document.getElementById("correo");
    const contrasena = document.getElementById("contrasena");
    const correoValido = correo.value.includes("@") && correo.value.includes(".");
    const claveValida = contrasena.value.trim().length >= 4;

    marcarCampo(correo, correoValido);
    marcarCampo(contrasena, claveValida);

    if (!correoValido || !claveValida) {
      mostrarMensaje("mensaje-login", "Revisa el correo y la contrasena.", "error");
      return;
    }

    try {
      const datos = await obtenerJSON(API_BASE + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: correo.value.trim(),
          password: contrasena.value.trim()
        })
      });

      sessionStorage.setItem("usuarioActivo", datos.usuario.nombre);
      mostrarMensaje("mensaje-login", "Inicio correcto. Redirigiendo...", "exito");
      setTimeout(() => window.location.href = "index.html", 800);
    } catch (error) {
      mostrarMensaje("mensaje-login", error.message, "error");
    }
  });
}

function iniciarRegistro() {
  const formulario = document.getElementById("form-registro");
  const contador = document.getElementById("contador-usuarios");
  if (!formulario) return;

  async function actualizarContador() {
    try {
      const usuarios = await obtenerJSON(API_BASE + "/usuarios");
      contador.textContent = "Usuarios registrados: " + usuarios.length;
    } catch (error) {
      contador.textContent = "Usuarios registrados: 0";
    }
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nombre = document.getElementById("nombre");
    const correo = document.getElementById("correo");
    const tipo = document.getElementById("tipo");
    const clave = document.getElementById("clave");
    const confirmar = document.getElementById("confirmar");

    const nombreValido = nombre.value.trim().length >= 5;
    const correoValido = correo.value.includes("@") && correo.value.includes(".");
    const tipoValido = tipo.value !== "";
    const claveValida = clave.value.length >= 4 && clave.value === confirmar.value;

    marcarCampo(nombre, nombreValido);
    marcarCampo(correo, correoValido);
    marcarCampo(tipo, tipoValido);
    marcarCampo(clave, claveValida);
    marcarCampo(confirmar, claveValida);

    if (!nombreValido || !correoValido || !tipoValido || !claveValida) {
      mostrarMensaje("mensaje-registro", "Completa los datos correctamente.", "error");
      return;
    }

    try {
      await obtenerJSON(API_BASE + "/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.value.trim(),
          correo: correo.value.trim(),
          password: clave.value,
          tipo: tipo.value
        })
      });

      formulario.reset();
      await actualizarContador();
      mostrarMensaje("mensaje-registro", "Usuario registrado correctamente.", "exito");
    } catch (error) {
      mostrarMensaje("mensaje-registro", error.message, "error");
    }
  });

  actualizarContador();
}

function iniciarMenu() {
  const mensaje = document.getElementById("seleccion-menu");
  const botones = document.querySelectorAll("[data-plato]");
  if (!mensaje || !botones.length) return;

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      localStorage.setItem("platoSeleccionado", boton.dataset.plato);
      mensaje.textContent = "Seleccionaste: " + boton.closest(".producto").querySelector("h3").textContent;
      mensaje.classList.add("exito");
    });
  });
}

function iniciarFormularioPedido() {
  const formulario = document.getElementById("form-pedido");
  const selectPlato = document.getElementById("plato");
  const cantidad = document.getElementById("cantidad");
  const total = document.getElementById("total-pedido");
  if (!formulario || !selectPlato || !cantidad || !total) return;

  function calcularTotal() {
    const producto = buscarProducto(selectPlato.value);
    const cantidadElegida = Number(cantidad.value) || 0;
    const totalCalculado = producto ? producto.precio * cantidadElegida : 0;
    total.textContent = "Total estimado: S/ " + totalCalculado.toFixed(2);
  }

  const parametros = new URLSearchParams(window.location.search);
  const platoElegido = parametros.get("plato") || localStorage.getItem("platoSeleccionado");
  if (platoElegido) selectPlato.value = platoElegido;

  selectPlato.addEventListener("change", calcularTotal);
  cantidad.addEventListener("input", calcularTotal);
  calcularTotal();

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const cliente = document.getElementById("cliente");
    const direccion = document.getElementById("direccion");
    const telefono = document.getElementById("telefono");
    const producto = buscarProducto(selectPlato.value);
    const cantidadElegida = Number(cantidad.value);

    const datosValidos =
      cliente.value.trim().length >= 5 &&
      direccion.value.trim().length >= 5 &&
      telefono.value.trim().length >= 6 &&
      producto &&
      cantidadElegida >= 1 &&
      cantidadElegida <= 20;

    marcarCampo(cliente, cliente.value.trim().length >= 5);
    marcarCampo(direccion, direccion.value.trim().length >= 5);
    marcarCampo(telefono, telefono.value.trim().length >= 6);
    marcarCampo(selectPlato, Boolean(producto));
    marcarCampo(cantidad, cantidadElegida >= 1 && cantidadElegida <= 20);

    if (!datosValidos) {
      mostrarMensaje("mensaje-pedido", "Completa el pedido con datos validos.", "error");
      return;
    }

    const pedido = {
      cliente: cliente.value.trim(),
      direccion: direccion.value.trim(),
      telefono: telefono.value.trim(),
      producto: producto.nombre,
      cantidad: cantidadElegida,
      total: producto.precio * cantidadElegida
    };

    try {
      await obtenerJSON(API_BASE + "/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
      });
    } catch (error) {
      guardarPedidoLocal(pedido);
    }

    localStorage.removeItem("platoSeleccionado");
    mostrarMensaje("mensaje-pedido", "Pedido guardado. Redirigiendo...", "exito");
    setTimeout(() => window.location.href = "pedidos.html", 900);
  });
}

function iniciarPedidos() {
  const tabla = document.getElementById("tabla-pedidos");
  const resumen = document.getElementById("resumen-pedidos");
  const boton = document.getElementById("limpiar-pedidos");
  if (!tabla) return;

  function agregarCelda(fila, texto) {
    const celda = document.createElement("td");
    celda.textContent = texto;
    fila.appendChild(celda);
  }

  async function pintarPedidos() {
    tabla.innerHTML = "";

    let pedidos;

    try {
      pedidos = await obtenerJSON(API_BASE + "/pedidos");
    } catch (error) {
      pedidos = obtenerPedidosLocales();
    }

    try {
      pedidos.forEach((pedido) => {
        const fila = document.createElement("tr");
        const estado = document.createElement("span");
        const celdaEstado = document.createElement("td");

        agregarCelda(fila, "P" + pedido.id_pedido);
        agregarCelda(fila, pedido.cliente);
        agregarCelda(fila, pedido.producto);
        agregarCelda(fila, pedido.cantidad);
        agregarCelda(fila, "S/ " + Number(pedido.total).toFixed(2));

        estado.textContent = pedido.estado;
        estado.className = "estado proceso";
        celdaEstado.appendChild(estado);
        fila.appendChild(celdaEstado);
        tabla.appendChild(fila);
      });

      resumen.textContent = "Total de pedidos mostrados: " + pedidos.length;
    } catch (error) {
      resumen.textContent = "No hay pedidos registrados.";
    }
  }

  boton?.addEventListener("click", async () => {
    try {
      await obtenerJSON(API_BASE + "/pedidos", { method: "DELETE" });
    } catch (error) {
      console.log("Limpiando solo pedidos locales:", error.message);
    }

    limpiarPedidosLocales();
    await pintarPedidos();
    resumen.textContent = "Pedidos limpiados correctamente.";
  });

  pintarPedidos();
}

async function iniciarOfertas() {
  const filtro = document.getElementById("filtro-ofertas");
  const contenedor = document.querySelector(".ofertas-grid");
  const aviso = document.getElementById("aviso-ofertas");
  if (!filtro || !contenedor || !aviso) return;

  async function filtrarOfertas() {
    const categoria = filtro.value;
    const url = API_BASE + "/ofertas" + (categoria !== "todas" ? "?categoria=" + categoria : "");

    try {
      const ofertas = await obtenerJSON(url);
      contenedor.innerHTML = "";

      ofertas.forEach((oferta) => {
        const articulo = document.createElement("article");
        articulo.className = "oferta";
        articulo.innerHTML = `
          <img class="imagen-oferta" src="${imagenes[oferta.nombre]}" alt="${oferta.nombre}">
          <h3>${oferta.nombre}</h3>
          <div class="precio"><strong>S/ ${Number(oferta.precio).toFixed(2)}</strong></div>
          <p>Descuento actual: ${oferta.descuento}</p>
        `;
        contenedor.appendChild(articulo);
      });

      aviso.textContent = "Ofertas visibles: " + ofertas.length;
    } catch (error) {
      aviso.textContent = "No se pudo conectar con el servidor.";
    }
  }

  filtro.addEventListener("change", filtrarOfertas);
  filtrarOfertas();
}

document.addEventListener("DOMContentLoaded", async () => {
  await cargarProductos();
  iniciarInicio();
  iniciarLogin();
  iniciarRegistro();
  iniciarMenu();
  iniciarFormularioPedido();
  iniciarPedidos();
  iniciarOfertas();
});
