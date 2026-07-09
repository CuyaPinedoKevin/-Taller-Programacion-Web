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

document.addEventListener("DOMContentLoaded", iniciarLogin);
