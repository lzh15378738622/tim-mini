// pages/talkList/index.js
const app = getApp()
import {genTestUserSig} from '../../static/utils/GenerateTestUserSig'
const tim = app.tim
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userID: 'user1',
        allConversation: [],
        modalVisible: false,
        conversation: {}//存储将要删除的对话
    },
    handleLogin() {
        let options = genTestUserSig(this.data.userID)
        options.runLoopNetType = 0
        if (options) {
            tim.login({
                userID: this.data.userID,
                userSig: options.userSig
            }).then(() => {
                tim.ready(() => {
                    this.getConversationList()
                })
            })
        }
    },
    // 获取会话列表
    getConversationList() {
        let self = this
        tim.getConversationList().then(function (imResponse) {
            const conversationList = imResponse.data.conversationList;
            self.setData({allConversation: conversationList})
        }).catch(function (imError) {
            console.warn('getConversationList error:', imError);
        });
    },
    longTimePress(e) {
        const item = e.currentTarget.dataset.item
        this.data.conversation = item
        this.handleModalShow()
    },
    handleModalShow() {
        this.setData({modalVisible: !this.data.modalVisible})
    },
    handleConfirm() {
        this.handleModalShow()
        this.deleteConversation(this.data.conversation)
    },
    // 将某会话设为已读
    setMessageRead(item) {
        if (item.unreadCount === 0) {
            return
        }
        tim.setMessageRead({
            conversationID: item.conversationID
        })
        this.getConversationList()
    },
    // 点击某会话
    checkoutConversation(e) {
        const item = e.currentTarget.dataset.item
        const name = item.userProfile.userID
        const conversationID = item.conversationID
        const type = item.type
        this.setMessageRead(item)

      let url = `/pages/chat/index?toAccount=${name}&conversationID=${conversationID}`
        wx.navigateTo({url})
    },

    // 删除会话
    deleteConversation(item) {
        let self = this;
        tim.deleteConversation(item.conversationID).then((res) => {
            console.log('delete success', res)
            self.getConversationList()
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.handleLogin()

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
      tim.ready(() => {
        this.getConversationList()
      })
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
