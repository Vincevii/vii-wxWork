import Util from './../util.js'

const Morning = {
    getWeather: function() {
        Util.getWeather()
    },

    init: async function() {
        // 先获取天气信息
        let weatherData = await Util.getWeather()

        // 构造数据展示
        let text = Util.renderTemplate(weatherData)
        
        // 发送数据
        Util.sendMsgWx(text)
    }
}

export default Morning