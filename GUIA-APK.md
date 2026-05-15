# Guía para generar el APK de FuelLog

## OPCIÓN A — PWA desde Chrome Android (más rápido, ya funciona)

Cuando subas los archivos a Netlify:
1. Abre Chrome en Android → ve a tu URL de Netlify
2. Espera ~10 segundos → Chrome mostrará banner "Añadir a pantalla de inicio"
3. O pulsa el botón morado "⚡ Instalar app" que ya tienes en la app
4. La app se instala SIN barra del navegador, como una app nativa

---

## OPCIÓN B — APK real para Google Play (Bubblewrap)

### Requisitos en tu PC (solo una vez)
1. Instalar Node.js: https://nodejs.org (versión LTS)
2. Instalar Android Studio: https://developer.android.com/studio
   - Solo necesitas el SDK, no el IDE completo
   - Durante instalación, anota la ruta del Android SDK

### Pasos

**1. Instalar Bubblewrap**
```
npm install -g @bubblewrap/cli
```

**2. Inicializar el proyecto (reemplaza la URL por la tuya)**
```
mkdir fuelog-apk
cd fuelog-apk
bubblewrap init --manifest https://TU-DOMINIO.netlify.app/manifest.json
```
Bubblewrap leerá tu manifest.json y configurará todo automáticamente.
Cuando pregunte por el Android SDK, pon la ruta que anotaste.

**3. Generar el APK**
```
bubblewrap build
```
Esto genera:
- `app-release-signed.apk` → para instalar directamente en Android
- `app-release-bundle.aab` → para subir a Google Play

**4. Instalar el APK en tu móvil sin Play Store**
- Copia el .apk al móvil (por cable o Drive)
- En Ajustes → Seguridad → activa "Instalar apps desconocidas"
- Abre el .apk → Instalar

**5. Para subir a Google Play**
- Necesitas cuenta de desarrollador Google Play (25€ pago único)
- Sube el .aab en https://play.google.com/console

---

## OPCIÓN C — Sin instalar nada (más fácil para el APK)

Usa PWABuilder online (de Microsoft, gratuito):
1. Ve a https://www.pwabuilder.com
2. Escribe tu URL de Netlify → Analizar
3. Descarga el paquete Android → genera el APK automáticamente
4. No necesitas Android Studio ni nada instalado

Esta es la opción más rápida para tener el APK.

---

## Sobre los créditos de Netlify

Los 300 minutos/mes son de BUILD (tiempo de compilación).
Tu proyecto es HTML estático → cada deploy dura ~5-10 segundos.
Con 150 minutos usados a mitad de mes → vas bien, no te preocupes.
Si se agotan, el sitio sigue online, solo no puedes hacer nuevos deploys hasta el día 11.
