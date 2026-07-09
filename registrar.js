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

document.addEventListener("DOMContentLoaded", iniciarRegistro);
