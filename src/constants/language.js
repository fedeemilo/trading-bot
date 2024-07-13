const { MARKET1, MARKET2 } = require('./variables')

module.exports = (lang = 'esp') => {
    const languages = {
        esp: {
            runningTime: 'Tiempo de Ejecución: ',
            withdrawalProfits: 'Ganancias de Retiro: ',
            realProfits: 'Ganancias Reales',
            closingBotOnLost: 'Cerrando Bot en Pérdidas...',
            closingBotOnWin: 'Cerrando Bot en Ganancias...',
            entryPrice: 'Precio de Entrada:',
            prevPrice: 'Precio Anterior:',
            newPrice: 'Nuevo Precio:',
            lastBuyOrder: 'Última Orden de Compra',
            buyPrice: 'Precio de Compra:',
            sellPrice: 'Precio de Venta:',
            stopLossPrice: 'Precio de Stop Loss:',
            strategy: 'Estrategia:',
            slLosses: 'Pérdidas de SL:',
            triggerPriceDown: 'Precio de Disparo Abajo:',
            orderAmount: 'Monto de Orden:',
            expectedProfit: 'Ganancia Esperada:',
            closingBot: 'Cerrando Bot...',
            gridProfits: 'Ganancias de Grid (Incl. fees):',
            balance: 'Balance en cuenta: ',
            currentBalance: 'Balance Actual: ',
            initialBalance: 'Balance Inicial: ',
            botStopedCorrectlyAllSelled:
                'Bot Detenido Correctamente, Todo Vendido',
            cannotSellInitialBalance:
                'No se ha podido vender el saldo inicial.',
            mustSellItManuallyOnBinance:
                'Debes venderlo manualmente en Binance.',
            buying: 'Comprando...',
            amountIn: 'Monto de entrada:',
            amountOut: 'Monto de salida:',
            selling: 'Vendiendo...',
            initiatingInCleanMode: 'Iniciando en modo limpio...',
            processingWithdrawal: 'Procesando retiro...',
            purchaseConfirmation: (order, totalCost) =>
                `Compró ${order.amount} ${MARKET1} por ${parseFloat(
                    BUY_ORDER.toFixed(2)
                )} ${MARKET2}, Precio: ${
                    order.buy_price
                }, Costo Total: ${totalCost.toFixed(2)} ${MARKET2}\n`
        },
        eng: {
            runningTime: 'Running Time:',
            withdrawalProfits: 'Withdrawal Profits: ',
            realProfits: 'Real Profits',
            closingBotOnLost: 'Closing Bot on Lost...',
            closingBotOnWin: 'Closing Bot on Win...',
            entryPrice: 'Entry Price:',
            prevPrice: 'Prev Price:',
            newPrice: 'New Price:',
            lastBuyOrder: 'Last Buy Order',
            buyPrice: 'Buy Price: ',
            sellPrice: 'Sell Price: ',
            stopLossPrice: 'Stop Loss Price:',
            strategy: 'Strategy:',
            slLosses: 'SL Losses:',
            triggerPriceDown: 'Trigger Price Down:',
            orderAmount: 'Order Amount: ',
            expectedProfit: 'Expected Profit:',
            closingBot: 'Closing Bot...',
            gridProfits: 'Grid Profits (Incl. fees):',
            balance: 'Balance in account:',
            currentBalance: 'Current Balance:',
            initialBalance: 'Initial Balance:',
            botStopedCorrectlyAllSelled: 'Bot Stoped Correctly, All Selled',
            cannotSellInitialBalance: 'Cannot sell initial balance.',
            mustSellItManuallyOnBinance:
                'You must sell it manually on Binance.',
            amountIn: 'Amount In:',
            amountOut: 'Amount Out:',
            selling: 'Selling...',
            initiatingInCleanMode: 'Initiating in clean mode...',
            processingWithdrawal: 'Processing withdrawal...',
            purchaseConfirmation: (order, totalCost) =>
                `Bought ${order.amount} ${MARKET1} for ${parseFloat(
                    BUY_ORDER.toFixed(2)
                )} ${MARKET2}, Price: ${
                    order.buy_price
                }, Total Cost: ${totalCost.toFixed(2)} ${MARKET2}\n`
        }
    }

    return languages[lang.toLowerCase()]
}
