const express = require("express");
const db = require("./database");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});
app.use(express.static(__dirname));

// INICIAR SESION
app.post("/login", (req, res) => {
  const { correo, password } = req.body;

  db.get(
    "SELECT id_usuario, nombre, correo, tipo FROM usuarios WHERE correo = ? AND password = ?",
    [correo, password],
    (err, usuario) => {
      if (err) {
        return res.status(500).json({ mensaje: err.message });
      }

      if (!usuario) {
        return res.status(400).json({ mensaje: "Usuario o contrasena incorrectos" });
      }

      res.json({ mensaje: "Inicio de sesion correcto", usuario });
    }
  );
});

// REGISTRAR USUARIO
app.post("/registrar", (req, res) => {
  const { nombre, correo, password, tipo } = req.body;

  db.run(
    "INSERT INTO usuarios (nombre, correo, password, tipo) VALUES (?, ?, ?, ?)",
    [nombre, correo, password, tipo],
    function (err) {
      if (err) {
        return res.status(400).json({ mensaje: "El correo ya existe" });
      }

      res.json({ mensaje: "Usuario registrado correctamente", id: this.lastID });
    }
  );
});


app.get("/usuarios", (req, res) => {
  db.all("SELECT id_usuario, nombre, correo, tipo FROM usuarios", [], (err, usuarios) => {
    if (err) {
      return res.status(500).json({ mensaje: err.message });
    }

    res.json(usuarios);
  });
});

// LISTAR PRODUCTOS
app.get("/productos", (req, res) => {
  db.all("SELECT nombre, categoria, precio, descuento FROM productos", [], (err, productos) => {
    if (err) {
      return res.status(500).json({ mensaje: err.message });
    }

    res.json(productos);
  });
});

// REGISTRAR PEDIDO
app.post("/pedidos", (req, res) => {
  const { cliente, direccion, telefono, producto, cantidad, total } = req.body;
  const cantidadNumero = Number(cantidad);
  const totalNumero = Number(total);

  if (
    !cliente ||
    !direccion ||
    !telefono ||
    !producto ||
    !Number.isFinite(cantidadNumero) ||
    cantidadNumero < 1 ||
    !Number.isFinite(totalNumero)
  ) {
    return res.status(400).json({ mensaje: "Datos del pedido incompletos o invalidos" });
  }

  db.run(
    "INSERT INTO pedidos (cliente, direccion, telefono, producto, cantidad, total, estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [cliente, direccion, telefono, producto, cantidadNumero, totalNumero, "Registrado"],
    function (err) {
      if (err) {
        return res.status(500).json({ mensaje: err.message });
      }

      res.json({ mensaje: "Pedido registrado correctamente", id: this.lastID });
    }
  );
});

// LISTAR PEDIDOS
app.get("/pedidos", (req, res) => {
  db.all(
    "SELECT id_pedido, cliente, producto, cantidad, total, estado FROM pedidos ORDER BY id_pedido DESC",
    [],
    (err, pedidos) => {
      if (err) {
        return res.status(500).json({ mensaje: err.message });
      }

      res.json(pedidos);
    }
  );
});

// OFERTAS ESPECIALES
app.get("/ofertas", (req, res) => {
  const categoria = req.query.categoria;
  const sql = categoria && categoria !== "todas"
    ? "SELECT nombre, categoria, precio, descuento FROM productos WHERE categoria = ?"
    : "SELECT nombre, categoria, precio, descuento FROM productos";
  const datos = categoria && categoria !== "todas" ? [categoria] : [];

  db.all(sql, datos, (err, ofertas) => {
    if (err) {
      return res.status(500).json({ mensaje: err.message });
    }

    res.json(ofertas);
  });
});

app.listen(3000, () => {
  console.log("Servidor iniciado en http://localhost:3000");
});



/*& "C:\Users\gemin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.js¨*/