
const request = require('request')
const RPC = 'https://rpc.tomochain.com'

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
        console.log(parseInt(res))
      } else {
        console.error(`Cannot get gasPrice`)
        console.error(result.error)
        process.exit(-1)
      }
    } catch (e) {
      console.error(`Cannot get gasPrice`)
      console.error(e)
      process.exit(-1)
    }
  }
  
  getGasPrice()