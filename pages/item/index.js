// pages/item/index.js
const app = getApp()
const tim = app.tim
const TIM = app.TIM
import { genTestUserSig } from '../../static/utils/GenerateTestUserSig'



Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentUser:'user3',//当前登录账号
    conversationTo:'user13213213'//发起会话的对象
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.handleLogin()
  },
  handleLogin() {
    let options = genTestUserSig(this.data.currentUser)
    options.runLoopNetType = 0
    if (options) {
      tim.login({
        userID: this.data.currentUser,
        userSig: options.userSig
      })
    }
  },

  connect(){
    let conversationID = TIM.TYPES.CONV_C2C + this.data.conversationTo
    let url = `/pages/chat/index?toAccount=${this.data.conversationTo}&conversationID=${conversationID}`
    wx.navigateTo({ url })
  },
  openConversationList(){
    wx.navigateTo({ url:"/pages/talkList/index" })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
