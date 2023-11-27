const noti_bot = require('noti_bot')
const notifySlack = noti_bot.slack
const notifyTelegram = noti_bot.telegram

const {
    getHealthCheckData,
    OK,
    ERROR
} = require('tomoscan-healthcheck')

const { sleep } = require('../utils')

const TESTNET_MODULE_IGNORE = {
    'cronjobs': true,
    'tokenTransfer': true,
    'internalTx': true,
}
const main = async () => {
    let errors = []

    // multiple api endpoints
    const endpoints = process.env.TOMOSCAN_ENDPOINT.split(',')

    for (const endpoint of endpoints) {
        console.log(`TOMOSCAN_ENDPOINT: ${endpoint}`)
        let data = await getHealthCheckData(endpoint)
        if (!data || !data.length) {
            return
        }
        console.log(data)
        for (const e of data) {
            if (e.status === ERROR) {
                // for testnet, ignore token txz, internal txs, cron token
                if (endpoint.includes('testnet') && TESTNET_MODULE_IGNORE[e.module]) {
                    continue
                }
                errors.push(`${endpoint} : ${e.error}`)
            }
        }
    }

    if (errors.length > 0) {
        let msg = errors.join("\n")

        if (process.env.SLACK_HOOK_KEY && process.env.SLACK_CHANNEL) {
            notifySlack(msg, process.env.SLACK_HOOK_KEY, process.env.SLACK_CHANNEL, process.env.SLACK_BOTNAME ?? 'tomoscan-healthcheck', process.env.SLACK_BOT_ICON ?? 'c98')
        }
        if (process.env.TELEGRAM_CHAT && process.env.TELEGRAM_TOKEN) {
            notifyTelegram(msg, process.env.TELEGRAM_TOKEN, process.env.TELEGRAM_CHAT, true)
        }
        console.error(msg)
        await sleep(1000)
        process.exit(-1)
    }
}
main()
