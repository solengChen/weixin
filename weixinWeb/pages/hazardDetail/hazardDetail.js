// pages/hazardDetail/hazardDetail.js
const app = getApp();
var detailUrl = "HazardOperationWebService.asmx/operatingGetHazardDetail";
var commentUrl = "HazardOperationWebService.asmx/operatingGetPageHazardComment";
const util = require("../../utils/util.js");
var scrollupper = true;
var scrolllower = false;
var touchStartY = 0;
var endDistance = 0;
var transTime = 20;
var startRotate = true;
var startLoadMore = false;
var rotateTime = 1;
var selectTime = null;
var windowHeight = 0;  //下滑阀值
Page({

  /**
   * 页面的初始数据
   */
  data: {
    token: null,
    hazardID: '',
    hazardBean: null,
    hazardStyle: ['物业', '消防设备', '消防电气','设备(电梯、空调)', '工程施工', '车辆', '食堂卫生','食堂用电','值守', '营业'],
    styleIndex: 0,
    topTabItems: ["详情页", "留言业"],
    currentTopItem: "0",
    swiperHeight: "0",
    commentData: [],
    animationData: {},
    animationData2: {},
    footerMarginBottom: 0,
    footerRefreshIcon: "../../images/arrow-up.png",
    footerText: "上拉加载",
    hasComment: true,
    footerHeight: 0
  },

  switchTab: function (e) {
    this.setData({
      currentTopItem: e.currentTarget.dataset.idx
    });
  },

  bindChange: function (e) {
    var that = this;
    that.setData({
      currentTopItem: e.detail.current
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.info(JSON.stringify(options));
    this.data.hazardID = options.hazardID;
    this.data.token = options.token;

    var that = this;
    wx.getStorage({
      key: 'userInfo',
      success: function (res) {
        if (res.errMsg == 'getStorage:ok') {
          //  that.data.token = res.data.Token;
          app.appRequest({
            url: detailUrl,
            data: {
              'token': that.data.token,
              'hazardID': that.data.hazardID
            }
          }, function (data) {
            that.setData({
              hazardBean: data[0]
            });
            // var date = new Date();
            selectTime = util.formatTime(new Date);
            that.commentGetPage();
          })
        }
      },
    })
    if (typeof (this.data.animationData2) != 'undefined' && this.data.animationData2 == null) {
      this.data.animationData2 = wx.createAnimation({
        duration: 500,
        timingFunction: "ease",
        delay: 0
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          swiperHeight: (res.windowHeight)
        });
        windowHeight = res.windowHeight
        console.log(windowHeight);
      },
    });
    var that = this;
    var query = wx.createSelectorQuery();
    query.select('#footer').boundingClientRect();
    query.exec(function(res){
      // console.log("footer height " + res[0].height);
      that.setData({
        footerHeight: res[0].height
      })
    })
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

  bindChangeStyle: function (e) {
    this.setData({
      styleIndex: e.detail.value
    })
  },

  touchStart: function (e) {
    // console.log(JSON.stringify(e));
    // console.log(JSON.stringify(this.data))
    touchStartY = e.touches[0].pageY;
    // if (typeof (this.animation) == 'undefined' || typeof (this.animation) != 'undefined' && this.animation == null) {
      
    // }
    var animationData = wx.createAnimation({
      duration: 500,
      timingFunction: "ease",
      delay: 0
    });
    // var animationData2 = wx.createAnimation({
    //   duration: 500,
    //   timingFunction: "ease",
    //   delay: 0
    // });
    // if(scrollupper){
    //   this.animation = animationData;
    // }
    // else if(scrolllower){
    //   this.animation = animationData2;
    // }
    this.animation = animationData;
  },

  touchEnd: function (e) {
    // console.log(JSON.stringify(e));
    var that = this;
    // endDistance = e.changedTouches[0].pageY - touchStartY;

    if (!startRotate && scrollupper) {
      if (endDistance > windowHeight / 10) {
        this.animation.opacity(1).translateY(windowHeight / 10).rotate(-180).step();
        this.setData({
          animationData: that.animation.export()
        })
        // that.data.headerFreshHeight = 100;
        setTimeout(function () {
          startRotate = true;
          that.rotateFresh();
          selectTime = util.formatTime(new Date());
          rotateTime = 1;
          that.commentGetPage();
        }, 500);
      }
      else if (endDistance > 0) {
        this.animation.opacity(1).translateY(0).rotate(-180).step();
        this.setData({
          animationData: that.animation.export()
        });
        // that.data.headerFreshHeight = -70;
      }
      endDistance = 0;
    }

    else if (!startLoadMore && scrolllower) {
      if (-endDistance > this.data.footerHeight) {
        var that = this;
        this.animation.opacity(1).translateY(-this.data.footerHeight * 0.7).step();
        this.setData({
          animationData2: that.animation.export(),
          footerRefreshIcon: "../../images/ic_refresh.gif",
          footerText: "正在刷新"
        })
        startLoadMore = true;
        setTimeout(function(){
          that.commentGetPage();
        }, 500);
      }
      else if (-endDistance > 0) {
        endDistance = 0;
        this.animation.opacity(1).translateY(0).step();
        this.setData({
          animationData2: that.animation.export()
        })
      }
    }
  },
  scroll: function (e) {
    if (scrollupper && e.detail.scrollTop > 5) {
      scrollupper = false;
    }
    else if (e.detail.scrollTop <= 5) {
      scrollupper = true;
    }
    if (scrolllower && (e.detail.scrollHeight - e.detail.scrollTop - 10) >= windowHeight) {
      scrolllower = false;
    }
    else if ((e.detail.scrollHeight - e.detail.scrollTop - 10) < windowHeight) {
      scrolllower = true;
    }
    console.log(JSON.stringify(e) + "lower " + scrolllower + " " + windowHeight);
  },
  touchMove: function (e) {
    // console.log(JSON.stringify(e));
    var courrentY = e.touches[0].pageY;

    if (scrollupper || scrolllower) {
      endDistance = courrentY - touchStartY;
    }

    var that = this;
    // console.log("distance = " + distance);
    if ((scrollupper || this.data.commentData.length == 0) && !startRotate) {
      // console.log("upper load endDistance " + endDistance);
      if (endDistance < windowHeight / 5) {
        this.animation.opacity(1).translateY(endDistance).rotate(2 * endDistance).step();
        this.setData({
          animationData: that.animation.export()
        });
      }
    }
    else if (scrolllower && !startLoadMore) {
      if (-endDistance < this.data.footerHeight) {
        this.animation.opacity(1).translateY(endDistance).step();
        this.setData({
          animationData2: that.animation.export()
        })
      }
    }
  },
  scrollupper: function (e) {
    console.log(JSON.stringify(e));
    scrollupper = true;
    scrolllower = false;
  },

  scrolllower: function (e) {
    scrolllower = true;
    scrollupper = false;
  },

  commentGetPage: function () {
    var that = this;
    app.appRequest({
      url: commentUrl,
      data: {
        'token': that.data.token,
        'hazardID': that.data.hazardID,
        'selectTime': selectTime,
        'pagenum': '10'
      }
    }, function (e) {
      if (typeof (e) != 'undefined' && e != null) {
        if (e.length > 0) {
          selectTime = e[e.length - 1].CommentCreateTime;
        }

        if (startRotate) {
          if (e.length > 0) {
            that.setData({
              hasComment: true
            })
          }
          else {
            that.setData({
              hasComment: false
            })
          }
          that.setData({
            commentData: e,
          });
          startRotate = false;
        }
        else if (startLoadMore) {
          if (e.length > 0) {
            var temp = that.data.commentData.concat(e)
            that.setData({
              commentData: temp,
            })
          }
          that.animation.opacity(1).translateY(0).step();
          that.setData({
            footerRefreshIcon: "../../images/arrow-up.png",
            footerText: "上拉加载",
            animationData2: that.animation.export()
          });
          startLoadMore = false;
        }
      }
    })
  },

  rotateFresh: function () {
    var that = this;
    if (startRotate) {
      rotateTime++;
      setTimeout(function () {
        that.animation.opacity(1).rotate(rotateTime * 360).step();
        that.setData({
          animationData: that.animation.export()
        });
        that.rotateFresh();
      }, 500);
    }
    else {
      setTimeout(function () {
        that.animation.opacity(0).translateY(0).rotate(0).step();
        that.setData({
          animationData: that.animation.export()
        });
      }, 500);
    }
  }
})