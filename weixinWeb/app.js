//app.js
// const wxParse = require('wxParse/wxParse.js')
var Parser = require('utils/dom-parser')
App({
  ipUrl: 'http://219.133.71.139:75/WebService/',
  roleChose: {},
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  },
  appRequest:function(params, action, needToast){
    if(needToast){
      wx.showToast({
        title: '请等待...',
        icon: 'loading'
      })
    }
    
    wx.request({
      url: this.ipUrl + params.url,
      method:'POST',
      data: params.data,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: function(res){
        var xmlParser = new Parser.DOMParser()
        var doc = xmlParser.parseFromString(res.data)
        if (typeof (doc) != 'undefined' && doc != null){
          var stringData = doc.getElementsByTagName("string")[0]
          if (stringData) {
            var result = stringData.firstChild.nodeValue
            console.log(result)
            if (result) {
              var json = JSON.parse(result)
              var resultCode = json.result.resultCode
              if (resultCode === '200001') {  //success
                if (action && typeof action == 'function') {
                  action(json.data)
                }
                if (needToast) {
                  wx.hideToast();
                }
              }
              else { //fail
                if (action && typeof action == 'function') {
                  action(json.data)
                }
                if (needToast) {
                  wx.hideToast();
                }
                wx.showModal({
                  title: '错误',
                  content: json.result.resultDesc,
                  confirmColor: '#b02923',
                  showCancel: false
                })
              }
              console.log('resultCode : ' + resultCode)
            }
            //res.statusCode
          }
        }
      }
    })
  },
  setStorageUser: function(params, callBack){
     wx.setStorage({
       key: 'userInfo',
       data: params,
       success: function(res){
         if(callBack && typeof callBack == 'function'){
           callBack(res)
         }
       }
     });
  }
})