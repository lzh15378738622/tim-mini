//app.js
import TIM from 'tim-wx-sdk'
import COS from "cos-wx-sdk-v5"
import { SDKAPPID } from './static/utils/GenerateTestUserSig'
const tim = TIM.create({
  SDKAppID: SDKAPPID
})
tim.setLogLevel(1)
tim.registerPlugin({ 'cos-wx-sdk': COS })

App({
    onLaunch: function() {
      
    },
    globalData: {

    },
  tim: tim,
  TIM: TIM,

})
