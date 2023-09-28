const request = require('request')
const noti_bot = require('noti_bot')
const notifySlack = noti_bot.slack
const notifyTelegram = noti_bot.telegram
const RPC = 'https://rpc.tomochain.com'
const { sleep } = require('../utils')

const main = async() => {
    const errors = []
    const [errGasPrice, errBlockNumber] = await Promise.all([
        getGasPrice(),
        getLatestBlockNumber(),
    ])
    if (errGasPrice) {
        errors.push(errGasPrice)
    }
    if (errBlockNumber) {
        errors.push(errBlockNumber)
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

const getGasPrice = async () => {
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
        if (!Number.isInteger(parseInt(res))) {
            return `RPC gasPrice error: Invalid gasPrice`
        }
        console.log(`gasPrice: ${parseInt(res)}`)
      } else {
        return `RPC gasPrice error:  ${result.error}`
      }
    } catch (e) {
        return `RPC gasPrice error: ${e.message}`
    }
  }
  

  const getLatestBlockNumber = async () => {
    try {
      const result = await new Promise((resolve, reject) => {
        request.post(
            RPC,
          {
            json: {
              jsonrpc: '2.0',
              method: 'eth_blockNumber',
              params: [],
              id: 89,
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
        if (!Number.isInteger(parseInt(res))) {
            return `RPC blockNumber error: Invalid blockNumber`
        }
        console.log(`BlockNumber: ${parseInt(res)}`)
      } else {
        return `RPC blockNumber error: ${result.error}`
      }
    } catch (e) {
        return `RPC blockNumber error: ${e.message}`
    }
  }
  
  main()
