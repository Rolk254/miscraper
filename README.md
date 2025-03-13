# API de Scraping de Productos

![Node.js](https://img.shields.io/badge/Node.js-v14+-green)
![MySQL](https://img.shields.io/badge/MySQL-v8+-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

Esta **API de Scraping** permite realizar el scraping de precios y obtener información de productos de tiendas en línea como **Amazon**, **MediaMarkt**, y **PCComponentes**. También incluye **funcionalidades de autenticación (JWT)**, **registro de usuarios**, y **gestión de productos** en una base de datos **MySQL**.

## 🚀 Características

- **Autenticación JWT** para seguridad y protección de endpoints.
- **Registro de Usuarios** y manejo de contraseñas de manera eficiente.
- **Scraping de productos** desde páginas de comercio electrónico (Amazon, MediaMarkt, PCComponentes).
- **Gestión de productos**: CRUD completo para productos (crear, leer, actualizar, eliminar).
- **Caching** de los resultados del scraping para mejorar el rendimiento.
- **Logs detallados** de cada acción importante en el servidor.
- **Pruebas automáticas** (si implementas una suite de tests).

## 📦 Requisitos

- **Node.js** (v14 o superior) - [Descargar Node.js](https://nodejs.org/)
- **MySQL** - [Descargar MySQL](https://dev.mysql.com/downloads/)

### Dependencias

La aplicación usa las siguientes dependencias para la creación de la API y la interacción con la base de datos:

- `express`
- `axios`
- `cheerio`
- `puppeteer`
- `cors`
- `mysql2/promise`
- `jsonwebtoken`
- `bcryptjs`
- `node-cache`

## 🛠 Instalación

### Clonar el repositorio

```bash
git clone https://github.com/tu_usuario/tu_repositorio.git
```

### Acceder al directorio

```bash
cd tu_repositorio
```

### Instalar las dependencias

```bash
npm install
```

### Configuración de la base de datos

Asegúrate de tener **MySQL** configurado y crea las tablas necesarias. Aquí hay un ejemplo de cómo debería verse tu tabla de productos:

```sql
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10, 2),
  source VARCHAR(100),
  imageUrl VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Configurar las variables de entorno

Crea un archivo `.env` en la raíz de tu proyecto con las siguientes variables:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=miScraper
JWT_SECRET=mi_secreto
```

### Iniciar el servidor

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`.

## ⚙️ Endpoints

### **/login (POST)**

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

### **/register (POST)**

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

### **/products (GET)**

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

### **/add-product (POST)** (Autenticado)

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

### **/delete-product/:id (DELETE)** (Autenticado)

Elimina un producto de la base de datos. Requiere autenticación con JWT.

**Respuesta:**
```json
{
  "message": "Producto eliminado"
}
```

### **/precio (GET)**

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

## 🔐 Seguridad

La API utiliza **JSON Web Tokens (JWT)** para la autenticación de usuarios. Después de hacer login, se genera un token que debe ser enviado en las cabeceras de las solicitudes autenticadas.

**Ejemplo de cabecera de autorización:**
```makefile
Authorization: Bearer JWT_TOKEN
```

## 📄 Logs

Los eventos importantes, como la adición y eliminación de productos y el inicio del servidor, se registran en un archivo `log.txt`.

## 📊 Ejemplo de uso con **Postman**

Puedes importar fácilmente el **Postman Collection** con todos los endpoints configurados. [Haz clic aquí para importar la colección de Postman](https://www.postman.com/).

## 🌐 Recursos Adicionales

- [Documentación de Express](https://expressjs.com/)
- [Documentación de Puppeteer](https://pptr.dev/)
- [Documentación de MySQL](https://dev.mysql.com/doc/)
- [Documentación de JWT](https://jwt.io/)
- [Postman](https://www.postman.com/) - Prueba tus endpoints con esta poderosa herramienta.
  
## 📝 Contribuir

Si deseas contribuir al proyecto, por favor abre un **pull request**. 

Si tienes alguna duda o sugerencia, puedes abrir un **issue** en el repositorio.

## 👥 Comunidad

Únete a la conversación y mantente al tanto de las actualizaciones:

- Twitter: [@lucasga53833277]([https://twitter.com/mi_usuario](https://x.com/lucasga53833277))
- Slack: [Enlace a Slack](https://slack.com/mi_enlace)
  
## 📌 Licencia

Este proyecto está licenciado bajo la **MIT License**. Consulta el archivo `LICENSE` para más detalles.

## 📸 Captura de Pantalla

Aquí tienes una visualización de cómo luce la API en acción.

![Screenshot](https://via.placeholder.com/600x400?text=API+Scraping+en+Acci%C3%B3n)

