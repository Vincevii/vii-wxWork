import Logic from './libs/logic/index.js'

let cmdType = process.argv[2] || ''

switch(cmdType) {
    case 'morning':
        Logic.morning.init()
        break;
    default :
        console.error(`输入指令为：${cmdType}，暂不支持!!!`)
        break
}