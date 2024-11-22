## Sistema de Turnos - Despliegue con Docker

Este documento describe cómo desplegar el sistema de turnos en una Raspberry Pi utilizando Docker y cómo conectarse a él desde tablets en la misma red local.

1. Requisitos previos
En tu máquina de desarrollo:
Tener Docker instalado en tu PC o laptop.
Tener el proyecto listo con un archivo Dockerfile en la raíz.

En la Raspberry Pi:
Raspberry Pi con Docker instalado. Si no está instalado:

Instala Docker ejecutando:

# curl -fsSL <https://get.docker.com> -o get-docker.sh

# sudo sh get-docker.sh

Agrega tu usuario al grupo Docker (opcional):
sudo usermod -aG docker $USER
2. Crear la imagen Docker
En tu máquina de desarrollo:

Navega al directorio del proyecto:

# cd /ruta/de/tu/proyecto

Construye la imagen Docker:

# docker build -t sistema-turnos

(Opcional) Verifica que la imagen fue creada:

# docker images

3. Transferir la imagen a la Raspberry Pi
Si no estás construyendo la imagen directamente en la Raspberry Pi, sigue estos pasos:

Exporta la imagen desde tu máquina de desarrollo:

# docker save sistema-turnos > sistema-turnos.tar

Transfiere el archivo .tar a la Raspberry Pi:

# scp sistema-turnos.tar pi@<IP_RASPBERRY>:/ruta/destino/

Importa la imagen en la Raspberry Pi:

# docker load < /ruta/destino/sistema-turnos.tar

4. Ejecutar el contenedor
En la Raspberry Pi, inicia el contenedor:

# docker run -d -p 3000:3000 --name sistema-turnos sistema-turnos

Verifica que el contenedor está corriendo:

# docker ps

Obtén la dirección IP local de la Raspberry Pi:

# hostname -I

Anota la dirección IP, que se verá como 192.168.x.x.
5. Acceder desde tablets
Asegúrate de que las tablets estén conectadas al mismo Wi-Fi o red local que la Raspberry Pi.

Abre el navegador en la tablet.

Ingresa la URL del sistema:

http://<IP_LOCAL_RASPBERRY>:3000
Ejemplo: Si la IP de la Raspberry Pi es 192.168.1.100, ingresa:

<http://192.168.1.100:3000>
(Opcional) Añade un acceso directo en la pantalla principal de la tablet:

Android (Chrome): Menú > "Añadir a pantalla de inicio".
iOS (Safari): Compartir > "Añadir a pantalla de inicio".
6. Actualizar el sistema
Si necesitas actualizar el sistema con nuevas versiones:

Detén el contenedor existente:

# docker stop sistema-turnos

# docker rm sistema-turnos

Crea una nueva imagen del proyecto (desde tu PC) o transfiérela de nuevo a la Raspberry Pi siguiendo los pasos anteriores.

Reinicia el contenedor con la nueva imagen:

# docker run -d -p 3000:3000 --name sistema-turnos sistema-turnos

7. (Opcional) Persistencia de datos
Si deseas que los datos del sistema (como la base de datos SQLite) persistan incluso si el contenedor se detiene o reinicia, monta un volumen local en el contenedor:

# docker run -d -p 3000:3000 --name sistema-turnos -v /ruta/local:/app/queue.db sistema-turnos

8. Solución de problemas
El sistema no es accesible desde las tablets:

Asegúrate de que la Raspberry Pi y las tablets están en la misma red.
Verifica que el contenedor está corriendo con docker ps.
Confirma que la Raspberry Pi permite conexiones al puerto 3000.
La URL no carga en las tablets:

Verifica la dirección IP local de la Raspberry Pi con hostname -I.
Asegúrate de usar el formato http://<IP_LOCAL>:3000.
