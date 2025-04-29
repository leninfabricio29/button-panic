
SafeGuard 🚨
SafeGuard es una aplicación móvil de botón de pánico desarrollada con React Native y Expo. Permite emitir alertas de emergencia de manera rápida y confiable, interactuando con la API principal alojada en:

BaseURL: https://softkilla.es/api/

Tecnologías
React Native (Expo SDK)

Node.js v20.9.0

Java 17

Expo Router (navegación)

Capacidades nativas Android (paquete: com.leninyanangomez.buttonpanic)

Requisitos
Node.js v20.9.0

Java 17

Expo CLI instalado globalmente:

bash
Copiar
Editar
npm install -g expo-cli
Dispositivo Android o emulador configurado.

Instalación
Clona el repositorio y configura las dependencias:

bash
Copiar
Editar
git clone git@github.com:leninfabricio29/button-panic.git
cd button-panic
npm install
Inicia el proyecto:

bash
Copiar
Editar
npx expo start
Para correrlo directamente en Android:

bash
Copiar
Editar
npx expo run:android
Estructura del Proyecto
El código está organizado por servicios que consumen las APIs externas.

Cada servicio gestiona la comunicación y el procesamiento de datos específico.

Configuración adicional
La aplicación utiliza Expo SDK y está configurada para Android con las siguientes características relevantes:

Slug: button-panic

Versión: 1.0.0

Paquete Android: com.leninyanangomez.buttonpanic

Iconos adaptativos personalizados

Notas
Asegúrate de tener el entorno de Android correctamente configurado (Android Studio o dispositivo físico).

La comunicación con la API es directa a través de HTTPS.