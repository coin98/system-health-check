const noti_bot = require('noti_bot')
const notifySlack = noti_bot.slack
const notifyTelegram = noti_bot.telegram

const { 
    getHealthCheckData, 
    STATUS_ERROR,
 } = require('@bobcoin98/tomomaster-healthcheck')

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

const main = async () => {
    console.log(`TOMOSMASTER_ENDPOINT: ${process.env.TOMOSMASTER_ENDPOINT}`)
    let data = await getHealthCheckData(process.env.TOMOSMASTER_ENDPOINT ?? 'https://master.tomochain.com')
    if (!data || !data.length) {
        return
    }
    console.log(data)
    let errors = []
    for (const e of data) {
        if (e.status === STATUS_ERROR) {
            errors.push(e.error)
        }
    }
    if (errors.length > 0) {
        let msg = process.env.TOMOSMASTER_PREFIX_MESSAGE + "\n" + errors.join("\n")

        if (process.env.SLACK_HOOK_KEY && process.env.SLACK_CHANNEL) {
            notifySlack(msg, process.env.SLACK_HOOK_KEY, process.env.SLACK_CHANNEL, process.env.SLACK_BOTNAME ?? 'tomomaster-healthcheck', process.env.SLACK_BOT_ICON ?? 'c98')
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
