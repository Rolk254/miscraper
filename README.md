# API de Scraping de Productos

Esta API permite realizar el scraping de precios y obtener información de productos de varias tiendas en línea como Amazon, MediaMarkt y PCComponentes. Además, tiene funcionalidades de autenticación (JWT), registro de usuarios, y gestión de productos en una base de datos MySQL.

## Funcionalidades

- **Autenticación JWT**: Seguridad en los endpoints mediante tokens.
- **Registro de usuarios**: Crea nuevos usuarios y realiza el login con credenciales.
- **Gestión de productos**: CRUD de productos almacenados en la base de datos.
- **Scraping de productos**: Obtén precios y detalles de productos desde tiendas como Amazon y PCComponentes.
  
## Requisitos

### Software necesario:
- **Node.js** (v14 o superior) - [Descargar Node.js](https://nodejs.org/)
- **MySQL** - [Descargar MySQL](https://dev.mysql.com/downloads/)

### Dependencias de Node.js:
La aplicación usa las siguientes dependencias para la creación de la API, manejo de la base de datos y el scraping:
- `express`: Framework para crear la API.
- `axios`: Para realizar solicitudes HTTP.
- `cheerio`: Para hacer scraping del contenido HTML.
- `puppeteer`: Para realizar el scraping en páginas web de manera controlada.
- `cors`: Middleware para permitir solicitudes de otros dominios.
- `mysql2/promise`: Cliente para interactuar con la base de datos MySQL utilizando promesas.
- `jsonwebtoken`: Para generar y verificar los tokens JWT.
- `bcryptjs`: Para gestionar contraseñas (aunque en este código no está siendo utilizado para hashear contraseñas).
- `node-cache`: Para almacenar en caché los resultados de scraping.

## Instalación

Sigue los pasos a continuación para instalar y ejecutar la API en tu máquina local.

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu_usuario/tu_repositorio.git
```

### 2. Acceder al directorio del proyecto

```bash
cd tu_repositorio
```

### 3. Instalar las dependencias

Asegúrate de tener `npm` o `yarn` instalado para poder gestionar las dependencias. Luego ejecuta:

```bash
npm install
```

### 4. Configurar la base de datos

Asegúrate de tener una base de datos MySQL configurada. Crea las tablas necesarias para almacenar usuarios y productos. Si necesitas ayuda, puedes encontrar la [documentación oficial de MySQL](https://dev.mysql.com/doc/).

### 5. Configuración de variables de entorno

Crea un archivo `.env` en la raíz del proyecto y añade las credenciales de tu base de datos. Ejemplo de archivo `.env`:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=miScraper
JWT_SECRET=mi_secreto
```

### 6. Iniciar el servidor

Una vez configurado todo, puedes iniciar el servidor con:

```bash
npm start
```

El servidor estará corriendo en `http://0.0.0.0:3000`.

## Endpoints

A continuación, se describen los principales endpoints de la API, sus parámetros y las respuestas esperadas.

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
Añade un nuevo producto a la base de datos. Requiere autenticación con JWT.

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

La API utiliza **JSON Web Tokens (JWT)** para la autenticación de usuarios. Después de hacer login, se genera un token que debe ser enviado en las cabeceras de las solicitudes autenticadas.

**Ejemplo de cabecera de autorización:**
```makefile
Authorization: Bearer JWT_TOKEN
```

## Logs

El servidor genera un archivo `log.txt` donde se registran eventos importantes, como la adición y eliminación de productos, y el inicio del servidor.

## Estructura del Proyecto

El proyecto está compuesto por los siguientes archivos principales:

- `app.js`: El archivo principal que maneja la configuración de la API.
- `log.txt`: Un archivo de log donde se registran eventos importantes del servidor.
- `package.json`: Archivo que contiene las dependencias y scripts del proyecto.

## Descripción del Código

### Dependencias:
- **express**: Framework para crear la API.
- **axios**: Para realizar solicitudes HTTP.
- **cheerio**: Para hacer parsing del contenido HTML y extraer datos.
- **puppeteer**: Para realizar el scraping de productos de forma controlada.
- **cors**: Middleware para habilitar solicitudes desde diferentes dominios.
- **mysql2/promise**: Cliente para interactuar con la base de datos MySQL utilizando promesas.
- **fs**: Para trabajar con el sistema de archivos, incluyendo el archivo de logs.
- **jsonwebtoken**: Para la generación y verificación de tokens JWT.
- **bcryptjs**: Para la gestión de contraseñas (aunque en este código no está siendo utilizado para hashear contraseñas).
- **node-cache**: Para almacenar en caché los resultados del scraping de productos.

### Configuración de la Base de Datos:
Se configura la conexión con MySQL utilizando `mysql2/promise`. Asegúrate de tener las credenciales correctas en el archivo `.env`.

### Autenticación:
Los endpoints que requieren autenticación usan JWT para verificar que el usuario esté autenticado antes de realizar ciertas operaciones, como añadir o eliminar productos.

### Funciones de Scraping:
El scraping se realiza mediante `puppeteer`, que abre un navegador controlado y extrae información de la página como el precio, la imagen y la fuente del producto.

## Recursos Adicionales

- [Documentación de Express](https://expressjs.com/)
- [Documentación de Puppeteer](https://pptr.dev/)
- [Documentación de MySQL](https://dev.mysql.com/doc/)
- [Documentación de JWT](https://jwt.io/)

## Contribución

Si deseas contribuir a este proyecto, por favor abre un **pull request** con tus cambios.

