# Trading Bot

## Descripción

Este bot automatiza el proceso de compra y venta de criptomonedas en la plataforma Binance. Utiliza claves API para transacciones seguras y cuenta con configuraciones personalizables para la toma de ganancias, stop-loss y estrategias de venta. El bot admite múltiples redes para retiros y puede notificar a los usuarios sobre las transacciones a través de Telegram. Diseñado para la eficiencia, incluye opciones para retirar ganancias, establecer porcentajes de compra/venta y gestionar transacciones con un sistema de rejilla de stop-loss. Ideal para comerciantes que buscan una solución automatizada para gestionar sus transacciones cripto.

## Instalación

Para instalar y configurar el bot, sigue estos pasos:

1. Clonar el proyecto: `git clone https://github.com/fedeemilo/trading-bot.git`

2. Instalar dependencias: `npm install`

3. Obtener `API_KEY` y `API_SECRET` de Binance y configurarlos en el archivo `.env`, así como la dirección de retiro para USDT para los retiros. Hay un `.env.example` de ejemplo para armar el `.env`. Al crear las credenciales API en Binance, es necesario marcar la opcion "Restringir el acceso solo para direcciones IP confiables" y agregar la IP Pública de la máquina donde se ejecutará el bot, para poder seleccionar las opciones de "Habilitar retiros" y "Habilitar Spot & Margin trading para que el bot pueda operar.

## Uso

Para usar el bot, ejecuta el siguiente comando en la terminal, especificando la criptomoneda a comprar/vender, la criptomoneda con la que se realizan las operaciones y el monto de cada operación.
También se puede agregar la palabra `resume` para obtener un resumen de la operación y el lenguaje en el que se desea recibir las notificaciones (por defecto es español).

```bash
npm start BTC USDT 20 // Orden de compra|venta de 20 USDT en Bitcoin (BTC)

npm start LTC USDT 100  // Orden de compra|venta de 100 USDT en Litecoin (LTC)

npm start TRX USDT 50 resume // Orden de compra|venta de 50 USDT en Tron (TRX) y resumen de la operación

npm start ETH USDT 10 resume eng // Orden de compra|venta de 10 USDT en Ethereum (ETH), resumen de la operación y lenguaje en inglés (por defecto es español)

npm start SOL USDT 100 - eng // Orden de compra|venta de 100 USDT en Solana (SOL) y lenguaje en inglés (por defecto es español)
```

## Comanto tbot

Pueden configurar un comando personalizado para ejecutar el bot en la terminal, agregando el siguiente código en el archivo `.bashrc` o `.bash_profile`:

```javascript
    tbot() {
        cd /path/bot/trading-bot // Ruta donde se encuentra el bot en su máquina
        if [[ "$#" -eq 2 ]]; then
                npm start "$1" USDT "$2" - esp
        elif [[ "$#" -eq 3 && "$3" == "resume" ]]; then
                npm start "$1" USDT "$2" resume esp
        elif [[ "$#" -eq 4 && "$4" == "-eng" ]]; then
                npm start "$1" USDT "$2" - eng
        else
                echo "Usage: tbot <MARKET1> <BUY_ORDER> [resume] [-lang]"
        fi
    }

```

Para utilizar el comando `tbot` en la terminal, es necesario reiniciar la terminal o ejecutar el comando `source ~/.bashrc` o `source ~/.bash_profile`.

## Ejemplos uso comando tbot

```javascript
tbot BTC 20 // Orden de compra|venta de 20 USDT en Bitcoin (BTC)
tbot LTC 100 - -eng // Orden de compra|venta de 100 USDT en Litecoin (LTC) y lenguaje en inglés (por defecto es español)
tbot TRX 200 resume // Orden de compra|venta de 200 USDT en Tron (TRX) y resumen de la operación

```
