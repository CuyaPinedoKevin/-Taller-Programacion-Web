const API_BASE = window.location.port === "3000" ? "" : "http://localhost:3000";

const productosBase = [
  { id: "combo-ensaladas", nombre: "Combo de ensaladas", precio: 10.00, categoria: "saludable", descuento: "-44%", imagen: "img/ensalada.png" },
  { id: "sandwiches", nombre: "Pack de sandwiches", precio: 8.50, categoria: "sandwiches", descuento: "-43%", imagen: "img/sandwiches.png" },
  { id: "postres", nombre: "Postres variados", precio: 6.00, categoria: "postres", descuento: "-50%", imagen: "img/postres.jpg" },
  { id: "plato-casero", nombre: "Plato casero", precio: 11.00, categoria: "casero", descuento: "-45%", imagen: "img/plato-casero.jpg" }
];

const imagenes = {
  "Combo de ensaladas": "img/ensalada.png",
  "Pack de sandwiches": "img/sandwiches.png",
  "Postres variados": "img/postres.jpg",
  "Plato casero": "img/plato-casero.jpg"
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
