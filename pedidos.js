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

document.addEventListener("DOMContentLoaded", iniciarPedidos);
