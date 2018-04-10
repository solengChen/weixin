//index.js
//获取应用实例
const app = getApp()
var loginUrl = 'UserAccountWebService.asmx/operatingLogin'
var freshTokenUrl = 'UserAccountWebService.asmx/operatingRefreshToken'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tip: '用户登录',
    userInfo: {},
    hasUserInfo: false,
    userPhone: false,
    userPWD: false,
    token:false,
    // loginSuccess:false,
    // roles: [],
    // num: 0,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
    else if (this.data.canIUse) {
      app.userInfoReadyCallback = res => {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }
    else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          console.log(e)
          app.globalData.userInfo = e.detail.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
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

  },

//对话框确认
  confirm: function(){
    this.setData({
      'dialog.hiden':true,
      'dialog.title':'',
      'dialog.content':''
    })
  },
  login:function(params){
    var that = this;
    app.appRequest({
      url: loginUrl,
      data: params,
    }, function (data) {
      if(data && data[0]){
        app.setStorageUser(data[0], function (res) {
          if (res.errMsg == 'setStorage:ok') {
            var temp = [];
            data[0].Identitys.map(function(element){
              temp.push(element.OrganizationName + " " + element.RoleName)
            });
            // that.setData({
            //   loginSuccess: true,
            //   roles: temp
            // });
            // that.roles = temp;
            wx.showActionSheet({
              itemList: temp,
              itemColor: '#007aff',
              success(res){
                app.roleChose = data[0].Identitys[res.tapIndex]
                wx.switchTab({
                  url: '../map/map',
                });
              }
            })
          }
        }, true);
      }
    })
  },
    formSubmit: function(e) {
      let that = this;
      let userPhone = e.detail.value.userPhone;
      let userPWD = e.detail.value.userPWD;

      if(userPhone === '' && userPWD === ''){
        wx.showModal({
          title: '警告',
          content: '用户名和密码不能为空白',
          confirmColor: '#b02923',
          showCancel: false
        })
        return false
      }
      var md5 = require('../../utils/md5.js')
      let params = {
        'userPhone': userPhone,
        'userPWD': md5.hexMD5(userPWD)
      }
      this.login(params)
    }
    // bindPickerRole: function(e){
    //   this.setData({
    //     num: e.detail.value
    //   });
    //   app.roleChose = e.detail.value;
      
    //   wx.switchTab({
    //     url: '../map/map',
    //   });
    // }
})