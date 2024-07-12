# trading-bot

## Descripción

Este bot automatiza el proceso de compra y venta de criptomonedas en la plataforma Binance. Utiliza claves API para transacciones seguras y cuenta con configuraciones personalizables para la toma de ganancias, stop-loss y estrategias de venta. El bot admite múltiples redes para retiros y puede notificar a los usuarios sobre las transacciones a través de Telegram. Diseñado para la eficiencia, incluye opciones para retirar ganancias, establecer porcentajes de compra/venta y gestionar transacciones con un sistema de rejilla de stop-loss. Ideal para comerciantes que buscan una solución automatizada para gestionar sus transacciones cripto.

## Instalación

Para instalar y configurar el bot, sigue estos pasos:

1. Clonar el proyecto:

2. Instalar dependencias: `npm install`

3. Obtener `API_KEY` y `API_SECRET` de Binance y configurarlos en el archivo `.env`, así como la dirección de retiro para USDT para los retiros. Hay un `.env.example` de ejemplo para armar el `.env`

## Uso

Para usar el bot, ejecuta el siguiente comando en la terminal, especificando la criptomoneda a comprar/vender, la criptomoneda con la que se realizan las operaciones y el monto de cada operación:

`node ./src/app BTC USDT 20`

Este comando iniciará el bot para operar con Bitcoin (BTC) y Tether (USDT), con un monto de operación de 20 USDT por transacción.
