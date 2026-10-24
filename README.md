# MediaGrab

MediaGrab es una aplicación web personal para descargar vídeos como MP4 o audio como MP3 usando `yt-dlp` y `ffmpeg`.

Debe utilizarse únicamente con contenido propio o con autorización de descarga. No se recomienda exponerla directamente a internet sin autenticación.

## Requisitos

Para ejecutar la aplicación localmente se necesita:

- Node.js 18 o superior.
- `yt-dlp` instalado y disponible en el PATH.
- `ffmpeg` instalado y disponible en el PATH.

En Docker, estos componentes ya están incluidos en la imagen.

## Instalación

Clonar el repositorio e instalar la dependencia de Node.js:

```bash
git clone https://github.com/abyssace/mediagrab.git
cd mediagrab
npm install
```

## Configurar el código de acceso

El servidor requiere la variable `MEDIA_GRAB_TOKEN`. Es un código compartido para impedir descargas no autorizadas.

Generar un código aleatorio con Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

No guardar el código en GitHub, en el frontend ni en archivos públicos.

## Ejecutar localmente

### Windows PowerShell

Si `yt-dlp` y `ffmpeg` están en el PATH:

```powershell
$env:MEDIA_GRAB_TOKEN = "codigo-secreto"
npm start
```

Si `yt-dlp` no está en el PATH, indicar su ubicación:

```powershell
$env:MEDIA_GRAB_TOKEN = "codigo-secreto"
$env:YTDLP_PATH = "C:\ruta\a\yt-dlp.exe"
npm start
```

### macOS y Linux

```bash
MEDIA_GRAB_TOKEN="codigo-secreto" npm start
```

Si `yt-dlp` no está en el PATH:

```bash
MEDIA_GRAB_TOKEN="codigo-secreto" YTDLP_PATH="/ruta/a/yt-dlp" npm start
```

El servidor queda disponible en:

```text
http://localhost:3000
```

Al iniciar una descarga, la aplicación solicitará el mismo código configurado en `MEDIA_GRAB_TOKEN`.

## Acceder desde otro dispositivo de la red local

El ordenador que ejecuta MediaGrab y el dispositivo cliente deben estar conectados a la misma red Wi-Fi o LAN.

1. Iniciar MediaGrab en el ordenador servidor.
2. Consultar su dirección IP local:

   ```powershell
   ipconfig
   ```

   En macOS o Linux:

   ```bash
   hostname -I
   ```

3. Identificar la dirección IPv4, por ejemplo `192.168.1.25`.
4. Abrir desde el celular, tablet u otro ordenador:

   ```text
   http://192.168.1.25:3000
   ```

5. Introducir el código de acceso cuando la aplicación lo solicite.

No utilizar `localhost` desde el dispositivo cliente: esa dirección apunta al propio dispositivo cliente.

### Firewall de Windows

Si no se puede conectar desde otro dispositivo, permitir el puerto 3000 en redes privadas. Ejecutar PowerShell como administrador:

```powershell
New-NetFirewallRule -DisplayName "MediaGrab 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Private
```

No reenviar el puerto del router ni publicar el servidor directamente en internet.

## Ejecutar con Docker

Construir la imagen:

```bash
docker build -t mediagrab .
```

Iniciar el contenedor:

```bash
docker run --rm -p 3000:3000 -e MEDIA_GRAB_TOKEN="codigo-secreto" mediagrab
```

Abrir `http://localhost:3000` o, desde otro dispositivo de la misma red, `http://IP-DEL-SERVIDOR:3000`.

## Cookies opcionales de YouTube

YouTube puede bloquear descargas desde servidores con IP de datacenter aunque el vídeo sea público. En ese caso se pueden proporcionar cookies propias mediante la variable secreta `YTDLP_COOKIES_B64`.

1. Exportar localmente un archivo Netscape `cookies.txt` de YouTube usando una herramienta de confianza.
2. No subir el archivo a GitHub ni compartirlo.
3. Convertirlo a Base64.

   En PowerShell:

   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\ruta\cookies.txt")) | Set-Clipboard
   ```

   En macOS/Linux:

   ```bash
   base64 -w 0 cookies.txt
   ```

4. Configurar el resultado como `YTDLP_COOKIES_B64`.
5. Reiniciar el servidor.

Las cookies son credenciales de sesión. Usar únicamente cookies propias y renovarlas si existe sospecha de exposición.

## Solución de problemas

### `EADDRINUSE: port 3000 already in use`

Ya existe otro proceso usando el puerto 3000. Detener el servidor anterior con `Ctrl + C` o finalizar el proceso que ocupa dicho puerto. También se puede utilizar otro puerto:

```powershell
$env:PORT = "3001"
npm start
```

En ese caso, abrir `http://localhost:3001`.

### `Failed to fetch`

- Confirmar que el servidor sigue ejecutándose.
- Usar la IP del ordenador servidor, no `localhost`, desde otro dispositivo.
- Confirmar que ambos dispositivos están en la misma red.
- Revisar el firewall.
- Recargar la página después de reiniciar el servidor.

### Código de acceso inválido

Comprobar que el valor introducido coincide exactamente con `MEDIA_GRAB_TOKEN`, incluyendo mayúsculas y minúsculas. No incluir comillas.

### Video privado o bloqueo de YouTube

Un vídeo privado, restringido por edad, no disponible o bloqueado por la IP del servidor puede requerir permisos o cookies válidas. La aplicación no elimina restricciones de acceso.

## Actualizar la aplicación

```bash
git pull origin main
npm install
```

Detener el proceso anterior y volver a iniciar MediaGrab después de actualizar.
