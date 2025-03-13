# API de Scraping de Productos

Esta API permite realizar el scraping de precios y obtener información de productos de varias tiendas en línea (Amazon, MediaMarkt, PCComponentes). Además, tiene funcionalidades de autenticación (JWT), registro de usuarios, y gestión de productos en una base de datos MySQL.

## Requisitos

- Node.js (v14 o superior)
- MySQL
- Navegador compatible con Puppeteer (recomendado Chromium)
- Dependencias de Node.js:
  - `express`
  - `axios`
  - `cheerio`
  - `puppeteer`
  - `cors`
  - `mysql2`
  - `fs`
  - `jsonwebtoken`
  - `bcryptjs`
  - `node-cache`

## Instalación

1. Clona este repositorio:

   ```bash
   git clone https://github.com/tu_usuario/tu_repositorio.git
# Guía de instalación y uso del proyecto

## Accede al directorio del proyecto:
```bash
cd tu_repositorio
```

## Instala las dependencias:
```bash
npm install
```

## Configura la base de datos. 
Asegúrate de tener una base de datos MySQL configurada con las tablas adecuadas para usuarios y productos.

### Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales de base de datos:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=miScraper
JWT_SECRET=mi_secreto
```

## Inicia el servidor:
```bash
npm start
```
El servidor estará corriendo en `http://0.0.0.0:3000`.

## Endpoints

### /login (POST)
Inicia sesión de un usuario. Recibe un correo electrónico y una contraseña.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "mi_contraseña"
}
```

**Respuesta:**
```json
{
  "message": "Login exitoso",
  "token": "JWT_TOKEN",
  "username": "nombre_de_usuario"
}
```

### /register (POST)
Registra un nuevo usuario. Recibe un nombre, correo electrónico y contraseña.

**Request Body:**
```json
{
  "name": "Nombre de Usuario",
  "email": "usuario@ejemplo.com",
  "password": "mi_contraseña"
}
```

**Respuesta:**
```json
{
  "message": "Usuario registrado exitosamente"
}
```

### /products (GET)
Obtiene todos los productos de la base de datos.

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Producto 1",
    "price": "100",
    "source": "Amazon",
    "imageUrl": "http://ejemplo.com/imagen.jpg",
    "createdAt": "2025-03-12T12:00:00Z"
  }
]
```

### /add-product (POST) (Autenticado)
Añade un nuevo producto. Requiere autenticación con JWT.

**Request Body:**
```json
{
  "name": "Nuevo Producto",
  "url": "http://ejemplo.com/producto",
  "price": "200",
  "source": "Amazon",
  "imageUrl": "http://ejemplo.com/imagen.jpg"
}
```

**Respuesta:**
```json
{
  "message": "Producto añadido",
  "id": 1
}
```

### /delete-product/:id (DELETE) (Autenticado)
Elimina un producto de la base de datos. Requiere autenticación con JWT.

**Respuesta:**
```json
{
  "message": "Producto eliminado"
}
```

### /precio (GET)
Realiza scraping para obtener el precio y la imagen de un producto desde una URL dada. El resultado se almacena en caché por 30 minutos.

**Request Query Parameters:**
- `url`: La URL del producto (debe ser de Amazon, MediaMarkt o PCComponentes).

**Respuesta:**
```json
{
  "price": "100 USD",
  "imageUrl": "http://ejemplo.com/imagen.jpg",
  "source": "Amazon"
}
```

## Seguridad
La API utiliza JSON Web Tokens (JWT) para la autenticación de usuarios. Al hacer login, se genera un token que debe ser enviado en las cabeceras de las solicitudes autenticadas.

**Ejemplo de cabecera de autorización:**
```makefile
Authorization: Bearer JWT_TOKEN
```

## Logs
El servidor genera un archivo `log.txt` donde se registran eventos importantes, como la adición y eliminación de productos y el inicio del servidor.

## Estructura del Proyecto
El proyecto está compuesto por los siguientes archivos principales:

- `app.js`: El archivo principal que maneja la configuración de la API.
- `log.txt`: Un archivo de log donde se registran eventos importantes del servidor.
- `package.json`: Archivo que contiene las dependencias y scripts del proyecto.

## Descripción del código

### Dependencias:
- `express`: Framework para crear la API.
- `axios`: Para realizar solicitudes HTTP.
- `cheerio`: Para hacer parsing del contenido HTML y extraer datos.
- `puppeteer`: Para realizar el scraping en páginas web de manera controlada.
- `cors`: Middleware para habilitar solicitudes desde diferentes dominios.
- `mysql2/promise`: Cliente para interactuar con la base de datos MySQL utilizando promesas.
- `fs`: Para trabajar con el sistema de archivos, incluyendo el archivo de logs.
- `jsonwebtoken`: Para la generación y verificación de tokens JWT.
- `bcryptjs`: Para la gestión de contraseñas (aunque en este código no está siendo utilizado para hashear contraseñas).
- `node-cache`: Para almacenar en caché los resultados del scraping de productos.

### Configuración de la Base de Datos:
Conexión con MySQL utilizando `mysql2/promise` y la configuración que contiene las credenciales de la base de datos.

### Autenticación:
Los endpoints que requieren autenticación usan JWT para verificar que el usuario esté autenticado antes de realizar ciertas operaciones, como añadir o eliminar productos.

### Funciones de Scraping:
El scraping se realiza mediante `puppeteer`, que abre un navegador controlado y extrae información de la página como el precio, la imagen y la fuente del producto.

