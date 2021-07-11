const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}

async function processMessage(msg) {
    const orderData = JSON.parse(msg.content);
    await updateReport(orderData);
    await printReport();
}

async function updateReport(orderData) {
    if (orderData.products && orderData.products.length) {
        orderData.products.forEach(product => {
            if (product.name) {
                if (!report[product.name]) {
                    report[product.name] = 1;
                } else {
                    report[product.name]++;
                }
            }
        });
    }
}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} vendas`);
    }
}

async function consume() {
    console.log(`INSCRITO COM SUCESSO NA FILA: ${process.env.RABBITMQ_QUEUE_NAME}`)
    await (await RabbitMQService.getInstance()).consume(process.env.RABBITMQ_QUEUE_NAME, (msg) => { processMessage(msg) })
}

consume()
