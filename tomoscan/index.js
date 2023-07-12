const noti_bot = require('noti_bot')
const notifySlack = noti_bot.slack

const { 
    getHealthCheckData, 
    OK,
    ERROR
 } = require('tomoscan-healthcheck')

const main = async () => {
    console.log(`TOMOSCAN_ENDPOINT: ${process.env.TOMOSCAN_ENDPOINT}`)
    let data = await getHealthCheckData(process.env.TOMOSCAN_ENDPOINT)
    if (!data || !data.length) {
        return
    }
    console.log(data)
    let errors = []
    for (const e of data) {
        if (e.status === ERROR) {
            errors.push(e.error)
        }
    }
    if (errors.length > 0) {
        let msg = process.env.PREFIX_MESSAGE + "\n" + errors.join("\n")

        if (process.env.SLACK_HOOK_KEY && process.env.SLACK_CHANNEL) {
            notifySlack(msg, process.env.SLACK_HOOK_KEY, process.env.SLACK_CHANNEL, process.env.SLACK_BOTNAME ?? 'tomoscan-healthcheck', process.env.SLACK_BOT_ICON ?? 'c98')
        }
        if (process.env.TELEGRAM_CHAT && process.env.TELEGRAM_TOKEN) {
            notifyTelegram(msg, process.env.TELEGRAM_TOKEN, process.env.TELEGRAM_CHAT, true)
        }
        console.error(msg)
        process.exit(-1)
    }
}
main()