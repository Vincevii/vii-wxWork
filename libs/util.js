
import axios from 'axios'
import dotenv from 'dotenv'
import config from './../config/index.js'

dotenv.config()

const Util = {
    // 获取环境变量
    getEnvConfig: () => {
    const { MESSAGE_TYPE, WX_COMPANY_ID, WX_APP_ID, WX_APP_SECRET, GAODE_API_KEY} = process.env

        return {
            message_type:  MESSAGE_TYPE || '',
            wx_company_id: WX_COMPANY_ID,
            wx_app_id: WX_APP_ID,
            wx_app_secret: WX_APP_SECRET,
            gaode_api_key: GAODE_API_KEY
        }
    },

    renderTemplate: function(data) {
        let text = `早晨！依家为你播报天气预报～\n\n`
        data.forEach(e => {
            let cityConfig = config.cityConfig

            let {name} = cityConfig.find(item => item.id == e.adcode)
            e.logicName = name

            let tem_text = this._getSingleText(e)
            text += `${tem_text}\n`
        })
        text += `本次天气预报播报完毕，我地听日同一时间再见～`
        return text
    },

    //https://developer.work.weixin.qq.com/document/path/90236
    sendMsgWx: async function(text) {
        try {
            // 获取token
            const accessToken = await this._getToken()
            
            axios({
                url: `${config.apis.wxWork}/cgi-bin/message/send?access_token=${accessToken}`,
                method: 'POST',
                data: {
                    touser: config.touser || '@all',
                    "msgtype" : "text",
                    agentid: process.env.WX_APP_ID,
                    "text" : {
                    "content" : text
                    }
                }
              }).then((response) => {
                console.log('wx:信息发送成功')
                console.log(response.data)
                return response.data
              }).catch((error) => {
                console.log('wx:信息发送失败！', error)
                return false
              })
              
          }
          catch (error) {
            console.log('wx:信息发送失败！', error)
            return false
          }
    },

    getWeather: async function(city) {
        let requestUrlPromise = this._buildWeatherUrl(city || '') || []
        
        let data = await Promise.allSettled(requestUrlPromise)

        // 过滤掉异常数据
        data = data.map(
            (n) => (n.status === 'fulfilled' ? n.value : null)
        )
        
        return data
    },

    _getToken: async function() {
        try {
            const response = await axios({
            url: `${config.apis.wxWork}/cgi-bin/gettoken?corpid=${process.env.WX_COMPANY_ID}&corpsecret=${process.env.WX_APP_SECRET}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            })
            return response.data.access_token
        }
        catch (error) {
            console.log(error)
            return ''
        }
    },

    _getSingleText: function(text) {
        return `${text.reporttime}\n${text.logicName}今日天气系${text.weather}\n气温预计为${text.temperature}摄氏度\n吹${text.winddirection}风\n`
    },

    _getSingleWeather: function(url) {
        return axios.get(url, {withCredentials: true}).then((response) => {
            let data = response.data
            
            if(data.status == 1) {
                return data.lives && data.lives[0]
            }else{
                return `status:${data.status}, info:${data.info}`
            }
          })
          .catch((error) => {
            return error
          })
    },

    _buildWeatherUrl: function(city) {
        const weatherUrl = config.apis.weather
        let requestUrl = []
        let { gaode_api_key } = this.getEnvConfig()

        // 如果没有取默认的
        if(!city) {
            city = config.cityConfig
        }

        city.forEach(element => {
            let url = `${weatherUrl}key=${gaode_api_key}&city=${element.id}`
            
            requestUrl.push(this._getSingleWeather(url))
        });

        return requestUrl
    }
} 

export default Util