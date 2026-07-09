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

document.addEventListener("DOMContentLoaded", iniciarOfertas);
