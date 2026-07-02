const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const rutaBaseDatos = path.join(__dirname, "fasstsave.db");

const db = new sqlite3.Database(rutaBaseDatos, (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Base de datos conectada:", rutaBaseDatos);
  }
});

db.on("trace", (sql) => {
  console.log("[SQL EJECUTADO]", sql);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      tipo TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      precio REAL NOT NULL,
      descuento TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente TEXT NOT NULL,
      direccion TEXT NOT NULL,
      telefono TEXT NOT NULL,
      producto TEXT NOT NULL,
      cantidad INTEGER NOT NULL,
      total REAL NOT NULL,
      estado TEXT NOT NULL
    )
  `);

  db.run(`
    INSERT OR IGNORE INTO productos (id_producto, nombre, categoria, precio, descuento)
    VALUES
      (1, 'Combo de ensaladas', 'saludable', 10.00, '-44%'),
      (2, 'Pack de sandwiches', 'sandwiches', 8.50, '-43%'),
      (3, 'Postres variados', 'postres', 6.00, '-50%'),
      (4, 'Plato casero', 'casero', 11.00, '-45%')
  `);
});

module.exports = db;
