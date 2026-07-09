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

document.addEventListener("DOMContentLoaded", iniciarInicio);
