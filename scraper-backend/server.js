const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const cors = require("cors");
const mysql = require("mysql2/promise");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const NodeCache = require("node-cache");

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de caché (por ejemplo, almacenar en caché durante 30 minutos)
const cache = new NodeCache({ stdTTL: 1800, checkperiod: 1800 });

// Clave secreta para JWT
const JWT_SECRET = "mi_secreto";

// Configuración de la base de datos
const dbConfig = {
    host: "miscraper.c7roxra7rvww.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "lucaspass",
    database: "miScraper",
};

const connectDB = async () => {
    return await mysql.createConnection(dbConfig);
};

// Función para loguear mensajes en un archivo
const logToFile = (message) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync("log.txt", `[${timestamp}] ${message}\n`, "utf8");
};

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "Token requerido" });

  // Verifica que el token tenga el prefijo 'Bearer '
  const tokenWithoutBearer = token.split(" ")[1]; 
  if (!tokenWithoutBearer) return res.status(403).json({ error: "Token inválido" });

  jwt.verify(tokenWithoutBearer, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Token inválido" });
      req.user = decoded; // Esto te da acceso a la información del usuario
      next();
  });
};


// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const connection = await connectDB();
        const [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
  
        if (rows.length === 0 || rows[0].password !== password) {
            return res.status(400).json({ error: "Credenciales incorrectas" });
        }
  
        // Crear un token JWT
        const token = jwt.sign({ userId: rows[0].id, username: rows[0].name }, JWT_SECRET, { expiresIn: '1h' });
  
        // Enviar la respuesta con el token y el nombre de usuario
        res.json({ message: "Login exitoso", token, username: rows[0].name });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
}); 

// Registro
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
      const connection = await connectDB();
      const [existingUser] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);

      if (existingUser.length > 0) {
          return res.status(400).json({ error: "El correo ya está registrado" });
      }

      await connection.execute(
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
          [name, email, password]
      );

      res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ error: "Error al registrarse" });
  }
});

// Obtener todos los productos
app.get("/products", async (req, res) => {
    try {
        const connection = await connectDB();
        const [rows] = await connection.execute("SELECT * FROM products ORDER BY createdAt DESC");
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error("Error obteniendo productos:", error);
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

// Añadir un producto (requiere autenticación)
app.post("/add-product", verifyToken, async (req, res) => {
    const { name, url, price, source, imageUrl } = req.body;
    if (!name || !url || !price || !source || !imageUrl) {
        return res.status(400).json({ error: "Datos del producto incompletos" });
    }

    try {
        const connection = await connectDB();
        const [result] = await connection.execute(
            "INSERT INTO products (name, url, price, source, imageUrl) VALUES (?, ?, ?, ?, ?)",
            [name, url, price, source, imageUrl]
        );
        await connection.end();
        logToFile(`Producto añadido: ${name}, Fuente: ${source}, Precio: ${price}`);
        res.status(201).json({ message: "Producto añadido", id: result.insertId });
    } catch (error) {
        console.error("Error añadiendo producto:", error);
        res.status(500).json({ error: "Error al añadir producto" });
    }
});

// Eliminar un producto (requiere autenticación)
app.delete("/delete-product/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await connectDB();
        await connection.execute("DELETE FROM products WHERE id = ?", [id]);
        await connection.end();
        logToFile(`Producto eliminado: ID ${id}`);
        res.status(200).json({ message: "Producto eliminado" });
    } catch (error) {
        console.error("Error eliminando producto:", error);
        res.status(500).json({ error: "Error al eliminar producto" });
    }
});

// Scraping para obtener precio e imagen (con caché)
app.get("/precio", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL requerida" });

    // Verificar si la URL ya está en caché
    const cachedData = cache.get(url);
    if (cachedData) {
        return res.json(cachedData);
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "domcontentloaded" });

        const content = await page.content();
        const $ = cheerio.load(content);

        let price, imageUrl, source;

        if (url.includes("mediamarkt")) {
            price = $("span[data-test='branded-price-whole-value']").text().trim() +
                $("span[data-test='branded-price-decimal-value']").text().trim() +
                $("span[data-test='branded-price-currency']").text().trim();
            imageUrl = $(".sc-72448dee-1 img").attr("src") || "";
            source = "MediaMarkt";
        } else if (url.includes("amazon")) {
            price = $("#priceblock_ourprice").text().trim() ||
                $("#priceblock_dealprice").text().trim() ||
                $(".a-price .a-offscreen").first().text().trim();
            imageUrl = $("#landingImage").attr("src") || "";
            source = "Amazon";
        } else if (url.includes("pccomponentes")) {
            // Extracción del precio
            price = $("#pdp-title").text().trim();            
            imageUrl = "test";
            source = "PCComponentes";
        } else {
            return res.status(400).json({ error: "URL no compatible" });
        }

        const productData = { price: price || "No encontrado", imageUrl, source };
        // Almacenar los datos en caché
        cache.set(url, productData);

        await browser.close();
        res.json(productData);
    } catch (error) {
        console.error("Error en el scraping:", error);
        res.status(500).json({ error: "Error al obtener los datos" });
    }
});

app.listen(3000, '0.0.0.0', () => {
    console.log("Servidor corriendo en http://0.0.0.0:3000");
    logToFile("Servidor iniciado en http://0.0.0.0:3000");
});
