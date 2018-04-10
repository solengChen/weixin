// mainpage.js
var app = getApp();
var maplistUrl = 'HazardOperationWebService.asmx/operatingGetPageHazardList';
var selectTime = '';
var hazardGrade = '';
var searchStr = '';
var beginTime = '';
var endTime = '';
var pagenum = '10';

const util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hazards:[],
    token:false,
    isUpLoading: false, //上拉加载
    isDownLoading: false, //下拉刷新
    no_more: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // selectTime = this.getCurrentTime();
    var that = this;
    console.log(JSON.stringify(options));
    //测试用
    if(typeof(options.token) != 'undefined' && options.token != null){
      this.data.token = options.token;
      wx.startPullDownRefresh();
    }
    else {
      wx.getStorage({
        key: 'userInfo',
        success: function (res) {
          if (res.errMsg == 'getStorage:ok') {
            that.data.token = res.data.Token;
            // that.refreshNewData();
            wx.startPullDownRefresh();
          }
        },
      });
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
    if(!this.data.isDownLoading){
      selectTime = util.formatTime(new Date());

      this.setData({
        isDownLoading: true,
        no_more: false
      });

      this.refreshNewData();
    }
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.no_more && !this.data.isUpLoading){
      this.setData({
        isUpLoading: true
      });
      this.refreshNewData();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  //刷新数据
  refreshNewData: function () {
    var that = this
    app.appRequest({
      url: maplistUrl,
      data: {
        'token': that.data.token,
        'hazardGrade': hazardGrade,
        'searchStr': searchStr,
        'beginTime': beginTime,
        'endTime': endTime,
        'selectTime': selectTime,
        'pagenum': pagenum
      }
    }, function (data) {
      setTimeout(function () {
        
        if (that.data.isDownLoading) {
          that.setData({
            hazards: data,
            isDownLoading: false
          });
          wx.stopPullDownRefresh();
        }
        else if (that.data.isUpLoading) {
          var temp = that.data.hazards.concat(data);
          
          that.setData({
            hazards: temp,
            isUpLoading: false
          })
        }

        if (data && data.length > 0) {
          selectTime = data[data.length - 1].HazardCreateTime;
          if(data.length < parseInt(pagenum)){
            that.setData({
              no_more: true
            });
          }
        }
        else {
          that.setData({
            no_more: true
          });
        }
      }, 2000);
    });
  },

  // getCurrentTime: function(){
  //   var date = new Date();
  //   var year = date.getFullYear();
  //   var month = date.getMonth() + 1;
  //   var day = date.getDate();
  //   var hour = date.getHours();
  //   var minute = date.getMinutes();
  //   var second = date.getSeconds();
    
  //   return year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second
  // }
})