const px = new (require('../index'))({apiKey: 'apiKey', apiSecret: 'apiSecret'});

const processedTrades = [];
const apiDelay = 5000;
let apiTimer;
(async function tick() {
    const tradesList = (await px.trade.list()).trades;

    console.log(`Found ${tradesList.length} active trades`);

    for (const trade of tradesList) {
        const hash = trade.trade_hash;
        console.log(hash);
        if (!processedTrades.includes(hash)) {
            console.log('Processing');
            processedTrades.push(hash);
            await px['trade-chat'].post({
                trade_hash: hash,
                message: 'test'
            });
        } else {
            console.log('Already processed');
        }
    }

    console.log(`\n${apiDelay}ms pause...\n`);

    apiTimer = setTimeout(tick, apiDelay);
})();

process.on('uncaughtException', function(error) {
    console.error('uncaughtException', error);
});

process.on('unhandledRejection', function(reason, p){
    console.error('unhandledRejection', reason);
});