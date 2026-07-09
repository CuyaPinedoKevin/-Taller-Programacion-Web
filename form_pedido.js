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

document.addEventListener("DOMContentLoaded", async () => {
  await cargarProductos();
  iniciarFormularioPedido();
});
