const request = require('request')
const noti_bot = require('noti_bot')
const notifySlack = noti_bot.slack
const notifyTelegram = noti_bot.telegram
const RPC = 'https://rpc.tomochain.com'
const { sleep } = require('../utils')

const getGasPrice = async () => {
    const errors = []
    try {
      const result = await new Promise((resolve, reject) => {
        request.post(
            RPC,
          {
            json: {
              jsonrpc: '2.0',
              method: 'eth_gasPrice',
              params: [],
              id: 88,
            },
            timeout: 10000,
          },
          (error, res, body) => {
            if (error) {
              logger.error(error)
              return resolve({ error: 1 })
            }
            return resolve(body)
          }
        )
      })
      if (!result.error) {
        const res = result.result
        console.log(parseInt(res))
      } else {
        errors.push(result.error)
      }
    } catch (e) {
        errors.push(e.message)
    }

    if (errors.length > 0) {
        let msg = `RPC ${RPC} error \n` + errors.join("\n")

        if (process.env.SLACK_HOOK_KEY && process.env.SLACK_CHANNEL) {
            notifySlack(msg, process.env.SLACK_HOOK_KEY, process.env.SLACK_CHANNEL, process.env.SLACK_BOTNAME ?? 'rpc-healthcheck', process.env.SLACK_BOT_ICON ?? 'c98')
        }
        if (process.env.TELEGRAM_CHAT && process.env.TELEGRAM_TOKEN) {
            notifyTelegram(msg, process.env.TELEGRAM_TOKEN, process.env.TELEGRAM_CHAT, true)
        }
        console.error(msg)
        await sleep(1000)
        process.exit(-1)
    }
  }
  
  getGasPrice()