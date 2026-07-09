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

document.addEventListener("DOMContentLoaded", iniciarMenu);
