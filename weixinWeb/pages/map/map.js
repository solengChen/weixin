const app = getApp();
var mapHazards = "HazardOperationWebService.asmx/operatingGetAllHazard";
var searchGrade = '';
var searStr = '';
var beginTime = '';
var endTime = '';
var mToken = '';
var wxMap = null;
Page({
  data: {
    height: 0,
    scale: 14,
    center: [113.324520, 23.099994],
    markers: []
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e)
    let mark = {}
    this.data.markers.map((ele) => {
      if (ele.id == e.markerId)
        mark = ele
    })
    wx.navigateTo({
      url: '../logs/logs?lat=' + mark.latitude + '&lng=' + mark.longitude + '&address=' + mark.address + '&distance=' + mark._distance
    })
    return
    wx.showModal({
      title: '危险源地图页',
      content: mark.address + ' (' + mark._distance.toFixed(0) + 'm)',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    })
  },
  onLoad: function(options) {
    var that = this;
    const system = wx.getSystemInfoSync();
    wxMap = new Map();
    this.setData({
      height: system.windowHeight
    })
    wx.getLocation({  //定位用户手机位置
      type: 'wgs84',
      success: (res) => {
        this.setData({
          center: [res.longitude, res.latitude]
        })
        console.log(res.longitude, res.latitude)
      }
    })
    //测试用
    if (typeof (options.token) != 'undefined' && options.token != null) {
      mToken = options.token;
      that.refreshMap();
    }
    else {
      wx.getStorage({
        key: 'userInfo',
        success: function (res) {
          mToken = res.data.Token
          // console.log('userInfo ' + JSON.stringify(res))
          if (res.errMsg == 'getStorage:ok') {
            that.refreshMap();
          }
        }
      })
    }
  },

  refreshMap: function(){
    var that = this;
    app.appRequest({
      url: mapHazards,
      data: {
        'token': mToken,
        'hazardGrade': searchGrade,
        'searchStr': searStr,
        'beginTime': beginTime,
        'endTime': endTime
      }
    }, function (data) {
      that.refreshMarker(data)
    })
  },

  refreshMarker: function(data){
    var arr = new Array();
    var that = this;
    data.map(function (value) {
      var location = value.BuildingLocation
      var locationArr = location.split(",")
      if (location) {
        if (wxMap.has(location)) {
          var marker = wxMap.get(location)
          var grade = value.HazardGrade
          wxMap.set(location, that.gradeSet(grade, marker, false))
        }
        else {
          var marker = {}
          marker.iconPath = "../../images/map-marker-radius.png"
          marker.latitude = locationArr[0]
          marker.longitude = locationArr[1]
          marker.id = value.BuildingID

          marker.width = 25
          marker.height = 25

          var grade = value.HazardGrade
          wxMap.set(location, that.gradeSet(grade, marker, true))
          arr.push(marker)
        }
      }
    })
    that.setData({
      markers: arr
    })
  },
  //设置每个marker包含的危险源各个等级的数量
  gradeSet: function (grade, marker, mtype) {
    switch (grade) {
      case "0":
        if (mtype) {
          marker.grade0 = 1;
          marker.grade1 = 0;
          marker.grade2 = 0;
          marker.grade3 = 0;
          marker.grade4 = 0;
        }
        else {
          marker.grade0++;
        }
        break;
      case "1":
        if (mtype) {
          marker.grade0 = 0;
          marker.grade1 = 1;
          marker.grade2 = 0;
          marker.grade3 = 0;
          marker.grade4 = 0;
        }
        else {
          marker.grade1++;
        }
        break;
      case "2":
        if (mtype) {
          marker.grade0 = 0;
          marker.grade1 = 0;
          marker.grade2 = 1;
          marker.grade3 = 0;
          marker.grade4 = 0;
        }
        else {
          marker.grade2++;
        }
        break;
      case "3":
        if (mtype) {
          marker.grade0 = 0;
          marker.grade1 = 0;
          marker.grade2 = 0;
          marker.grade3 = 1;
          marker.grade4 = 0;
        }
        else {
          marker.grade3++;
        }
        break;
      case "4":
        if (mtype) {
          marker.grade0 = 0;
          marker.grade1 = 0;
          marker.grade2 = 0;
          marker.grade3 = 0;
          marker.grade4 = 1;
        }
        else {
          marker.grade4++;
        }
        break;
    }
    return marker;
  },
  //点击缩放按钮动态请求数据
  controltap(e) {
    var that = this;
    console.log("scale===" + this.data.scale)
    if (e.controlId === 1) {
      // if (this.data.scale === 13) {
      that.setData({
        scale: --this.data.scale
      })
      // }
    } else {
      // if (this.data.scale !== 13) {
      that.setData({
        scale: ++this.data.scale
      })
      // }
    }
  },
  jumpToAddHazard: function(){
    wx.navigateTo({
      url: '../addHazard/addHazard',
    })
  }
})