// pages/chat/index.js
const app = getApp()
const tim = app.tim
const TIM = app.TIM
import {emojiMap, emojiName, emojiUrl} from '../../static/utils/emojiMap'
import {formatTime} from '../../static/utils/index'
import {decodeElement} from '../../static/utils/decodeElement'


Page({

    /**
     * 页面的初始数据
     */
    data: {
        isIpx: false,
        currentConversationID: '',
        nextReqMessageID: '',
        isCompleted: false,
        isLoading: false,
        currentMessageList: [],
        emojiName: emojiName,
        emojiMap: emojiMap,
        emojiUrl: emojiUrl,
        messageContent: '',
        toAccount: '',
        conversationType: 'C2C',
        isFocus: false,
        isMoreOpen: false,
        isEmojiOpen: false,
        downloadInfo: {},
        percent: 0,
        sysInfo: {},

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let self = this;
        self.data.currentConversationID = options.conversationID;
        self.data.toAccount = options.toAccount

        self.getMessageList()

        wx.setNavigationBarTitle({
            title: options.toAccount
        })
        let sysInfo = wx.getSystemInfoSync()
        self.sysInfo = sysInfo
        self.height = sysInfo.windowHeight
        self.isIpx = (sysInfo.model.indexOf('iPhone X') > -1)
        let query = wx.createSelectorQuery()
        tim.on(TIM.EVENT.MESSAGE_RECEIVED, (event) => {
            self.onMessageEvent(event)
        })
        let interval = setInterval(() => {
            if (self.data.currentMessageList.length !== 0) {
                self.scrollToBottom()
                clearInterval(interval)
            }
        }, 600)
    },
// 滚动到列表bottom
    scrollToBottom() {
        wx.pageScrollTo({
            scrollTop: 99999
        })
    },
    handleInput(e) {
        this.setData({
            messageContent: e.detail.value
        })
    },
    // 失去焦点
    loseFocus() {
        this.handleClose()
    },
    // 下载文件模态框
    handleModalShow() {
        this.modalVisible = !this.modalVisible
    },

    // 处理emoji选项卡
    handleEmoji() {
        if (this.isFocus) {
            this.setData({
                isFocus: false,
                isEmojiOpen: true
            })
        } else {
            this.setData({
                isMoreOpen: false,
                isEmojiOpen: !this.data.isEmojiOpen
            })
        }
    },
    // 处理更多选项卡
    handleMore() {
        if (this.isFocus) {
            this.setData({
                isMoreOpen: true,
                isFocus: false
            })
        } else {
            this.setData({
                isMoreOpen: !this.data.isMoreOpen,
                isEmojiOpen: false
            })
        }
    },
    // 选项卡关闭
    handleClose() {
      this.setData({
        isFocus:false,
        isMoreOpen: false,
        isEmojiOpen: false
      })
    },
    isnull(content) {
        if (content === '') {
            return true
        }
        const reg = '^[ ]+$'
        const re = new RegExp(reg)
        return re.test(content)
    },
    // 发送text message 包含 emoji
    sendMessage() {
        if (!this.isnull(this.data.messageContent)) {
            const message = tim.createTextMessage({
                to: this.data.toAccount,
                conversationType: this.data.conversationType,
                payload: {text: this.data.messageContent}
            })
            let index = this.data.currentMessageList.length
            this.updateMessage(message)
            tim.sendMessage(message).then((res) => {
                //更新消息状态
                this.updateMessageStatue(res.data.message)
            }).catch(() => {

            })
            this.setData({messageContent: ''})
        } else {
            wx.showToast({
                title: '消息不能为空',
                icon: 'none',
            })
        }

        this.setData({
            isFocus: false,
            isEmojiOpen: false,
            isMoreOpen: false
        })
    },
    updateMessage(message) {
        message.virtualDom = decodeElement(message.elements[0])
        let date = new Date(message.time * 1000)
        message.newtime = formatTime(date)
        this.data.currentMessageList.push(message)
        this.setData({currentMessageList: this.data.currentMessageList})
        this.scrollToBottom()
    },
    updateMessageStatue(message) {
        this.data.currentMessageList.pop()
        this.data.currentMessageList.push(message)
        this.setData({currentMessageList: this.data.currentMessageList})
    },
    // 消息事件
    onMessageEvent(event) {
        if (event.name === 'onMessageReceived') {
            let id = this.data.currentConversationID
            if (!id) {
                return
            }
            let list = []
            event.data.forEach(item => {
                if (item.conversationID === id) {
                    list.push(item)
                }
            })
            this.receiveMessage(this.data.currentMessageList, list)
        }
    },
    // 收到
    receiveMessage(currentList, messageList) {
        let list = [...messageList]
        for (let i = 0; i < list.length; i++) {
            let item = list[i]
            list[i].virtualDom = decodeElement(item.elements[0])
            let date = new Date(item.time * 1000)
            list[i].newtime = formatTime(date)
        }
        currentList.push.apply(currentList, list)
        this.setData({currentMessageList: currentList})
        this.scrollToBottom()
    },
    sendPhoto(e) {
        let name = e.currentTarget.dataset.type
        let self = this
        if (name === 'album') {
            self.chooseImage(name)
        } else if (name === 'camera') {
            wx.getSetting({
                success: function (res) {
                    if (!res.authSetting['scope.camera']) { // 无权限，跳转设置权限页面
                        wx.authorize({
                            scope: 'scope.camera',
                            success: function () {
                                self.chooseImage(name)
                            }
                        })
                    } else {
                        self.chooseImage(name)
                    }
                }
            })
        }
    },
    chooseImage(name) {
        let self = this
        let message = {}
        wx.chooseImage({
          sourceType: [name],
            count: 1,
            success: function (res) {
                message = tim.createImageMessage({
                    to: self.data.toAccount,
                    conversationType: self.data.conversationType,
                    payload: {
                        file: res
                    },
                    onProgress: percent => {
                        self.data.percent = percent
                    }
                })
               self.updateMessage(message)
                tim.sendMessage(message).then((res) => {
                    self.data.percent = 0
                    self.updateMessageStatue(res.data.message)
                }).catch((err) => {
                    console.log(err)
                })
            }
        })
        this.handleClose()
    },
    previewImage(e) {
      let src= e.currentTarget.dataset.src
        wx.previewImage({
            current: src, // 当前显示图片的http链接
            urls: [src]
        })
    },
    // 发消息选中emoji
    chooseEmoji(e) {
        // this.messageContent += item
        let item = e.currentTarget.dataset.item
        this.setData({
            messageContent: this.data.messageContent += item
        })
    },
    // 重发消息
    handleResend(e) {
      let message = e.currentTarget.dataset.message
        if (message.status === 'fail') {
            tim.resendMessage(message)
        }
    },

    // 历史头插消息列表
    unshiftMessageList(messageList) {
        const curMessList = this.data.currentMessageList
        let list = [...messageList]
        for (let i = 0; i < list.length; i++) {
            let message = list[i]
            list[i].virtualDom = decodeElement(message.elements[0])
            let date = new Date(message.time * 1000)
            list[i].newtime = formatTime(date)
        }
        return curMessList.length ? [...list, this.data.currentMessageList] : [...list]
    },
    // 获取消息列表
    getMessageList() {
        const {currentConversationID, nextReqMessageID} = this.data
        // 判断是否拉完了
        if (!this.data.isCompleted) {
            if (!this.data.isLoading) {
                this.setData({isLoading: true})
                tim.getMessageList({
                    conversationID: currentConversationID,
                    nextReqMessageID: nextReqMessageID,
                    count: 15
                }).then(res => {
                    this.data.nextReqMessageID = res.data.nextReqMessageID
                    let list = this.unshiftMessageList(res.data.messageList)
                    this.setData({currentMessageList: list})
                    if (res.data.isCompleted) {
                        this.setData({isCompleted: true})
                        wx.showToast({
                            title: '更新成功',
                            icon: 'none',
                            duration: 1500
                        })
                    }
                    this.data.isLoading = false
                }).catch(err => {
                    console.log(err)
                })
            } else {
                wx.showToast({
                    title: '你拉的太快了',
                    icon: 'none',
                    duration: 500
                })
            }
        } else {
            wx.showToast({
                title: '没有更多啦',
                icon: 'none',
                duration: 1500
            })
        }
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
