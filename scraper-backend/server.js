const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer-core");
const chrome = require("chrome-aws-lambda");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

let products = [];

// Ruta para obtener el precio y la imagen
app.get("/precio", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL requerida" });

  try {
    // Lanzamos el navegador en modo headless
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "load" });

    // Obtener el contenido de la página
    const content = await page.content();
    console.log("Contenido HTML de la página:", content); // Imprimir el contenido HTML

    const $ = cheerio.load(content);

    let price, imageUrl, source;

    // Scraping para MediaMarkt
    if (url.includes("mediamarkt")) {
      price =
        $("span[data-test='branded-price-whole-value']").text().trim() +
        $("span[data-test='branded-price-decimal-value']").text().trim() +
        $("span[data-test='branded-price-currency']").text().trim();

      imageUrl =
        $(".sc-72448dee-1 img").attr("src") ||
        "https://play-lh.googleusercontent.com/_916PrtBlHNV3zVEYCeAAzBJfpsSgX1Ey0WoAdjX6c_XtOf9cctXafoQPEBdoFOMn2M";

      source = "MediaMarkt";
    }
    // Scraping para Amazon
    else if (url.includes("amazon")) {
      price =
        $("#priceblock_ourprice").text().trim() ||
        $("#priceblock_dealprice").text().trim() ||
        $(".a-price .a-offscreen").first().text().trim();

      imageUrl =
        $("#landingImage").attr("src") ||
        "https://play-lh.googleusercontent.com/_916PrtBlHNV3zVEYCeAAzBJfpsSgX1Ey0WoAdjX6c_XtOf9cctXafoQPEBdoFOMn2M";

      source = "Amazon";
    } else {
      return res.status(400).json({ error: "URL no compatible" });
    }

    console.log("Scraping:", { price, imageUrl });

    // Cerramos el navegador
    await browser.close();

    return res.json({ price: price || "No encontrado", imageUrl, source });
  } catch (error) {
    console.error("Error al obtener el precio:", error.message || error);
    res.status(500).json({ error: error.message || "Error en el scraping" });
  }
});

// Ruta para obtener todos los productos
app.get("/products", (req, res) => {
  res.json({ products });
});

// Ruta para añadir un producto
app.post("/add-product", (req, res) => {
  console.log("Datos recibidos en /add-product:", req.body);

  const { name, url, price, source, imageUrl } = req.body;
  if (!name || !url || !price || !source || !imageUrl) {
    return res.status(400).json({ error: "Datos del producto incompletos" });
  }

  const newProduct = {
    id: uuidv4(),
    name,
    url,
    price,
    source,
    imageUrl,
    createdAt: new Date().toISOString(), // Añadir el timestamp de creación
  };
  products.push(newProduct);

  res.status(201).json({ message: "Producto añadido", product: newProduct });
});

// Ruta para eliminar un producto
app.delete("/delete-product/:id", (req, res) => {
  const { id } = req.params;
  products = products.filter((product) => product.id !== id);
  res.status(200).json({ message: "Producto eliminado" });
});

// Ruta para limpiar los productos
app.delete("/clear-products", (req, res) => {
  products = [];
  res.status(200).json({ message: "Productos limpiados" });
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
