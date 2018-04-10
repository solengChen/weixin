// pages/addHazard/addHazard.js
var currentBindIndex = -1;
var longBind = false;
const util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
     hazardType: ['物业','安保','消防'],
     typeIndex: 0,
     addButtonHeight: 0,
     addbtnviews:[
       {
         btnid: '0',
         imagepath:"../../images/ic_addpic.png",
         uploadname: '',
         viewclass: 'addBtn'
       }
     ],
     personName: '',
     phoneNum: ''
  },

  bindChangeType: function(e){
     this.setData({
       typeIndex: e.detail.value
     })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.data.addbtnviews[0].uploadname = util.randomString(32);
    wx.getStorage({
      key: 'userInfo',
      success: function(res) {
        if (res.errMsg =='getStorage:ok'){
          that.setData({
            personName: res.data.UserName,
            phoneNum: res.data.PhoneNum
          })
        }
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    var query = wx.createSelectorQuery();
    query.select('.addBtn').boundingClientRect();
    query.exec(function(res){
      console.log(JSON.stringify(res))
       that.setData({
         addButtonHeight: res[0].width
       })
    });
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

  addphoto: function(e){
    if(!longBind){
      console.log(JSON.stringify(e));
      currentBindIndex = parseInt(e.target.id);
      if (currentBindIndex < this.data.addbtnviews.length) {
        if (this.data.addbtnviews[currentBindIndex].imagepath == "../../images/ic_addpic.png") {
          var that = this;
          wx.showActionSheet({
            itemList: ['相机', '相册'],
            success: function (res) {
              switch (res.tapIndex) {
                case 0: that.imageChoose('camera');
                  break;
                case 1: that.imageChoose('album');
                  break;
              }
            }
          })
        }
        else {
          this.checkimage(currentBindIndex)
        }
      }
    }
  },
  checkOrRemove: function(e){
    longBind = true;
    console.log(JSON.stringify(e));
    currentBindIndex = parseInt(e.target.id);
    if (currentBindIndex < this.data.addbtnviews.length) {
      if (this.data.addbtnviews[currentBindIndex].imagepath != "../../images/ic_addpic.png") {
        var that = this;
        wx.showActionSheet({
          itemList: ['查看', '删除'],
          success: function (res) {
            switch (res.tapIndex) {
              case 0: that.checkimage(currentBindIndex)
                break;
              case 1: that.deleteimage(currentBindIndex)
                break;
            }            
          },
          complete: function () {
            longBind = false;
          }
        })
      }
    }
  },
  imageChoose: function(source){
    var that = this;
     wx.chooseImage({
       count: 1,
       sizeType: ['compressed'],
       sourceType: [source],
       success: function(res) {
         if(currentBindIndex != -1){
           console.log(res.tempFilePaths);
           that.data.addbtnviews[currentBindIndex].imagepath = res.tempFilePaths[0];
           if (currentBindIndex < 5) {
             that.afterAddImage();
           }
           else {
             that.setData({
               addbtnviews: that.data.addbtnviews
             });
             currentBindIndex = -1;
           }
         }
       },
     })
  },

//相册或拍照添加图片成功后
  afterAddImage: function(){
    this.data.addbtnviews.push({
      btnid: '' + (1 + currentBindIndex),
      imagepath: "../../images/ic_addpic.png",
      viewclass: 'addBtn'
    });
    this.setData({
      addbtnviews: this.data.addbtnviews
    });
    currentBindIndex = -1;
  },

  checkimage: function(idx){
    var that = this;
    var images = [];
    
    this.data.addbtnviews.map(function(element){
      if (element.imagepath != "../../images/ic_addpic.png"){
        images.push(element.imagepath);
      }
    })
    wx.previewImage({
      urls: images,
      current: that.data.addbtnviews[idx].imagepath
    })
  },

  deleteimage: function(idx){
     var temp = this.data.addbtnviews;
     temp.splice(idx, 1);
     var i = idx;
     for(; i < temp.length; i++){
       temp[i].btnid = '' + i;
     }
     if (temp.length == 5 && temp[4].imagepath != "../../images/ic_addpic.png"){
       temp.push({
         btnid: '5',
         imagepath: "../../images/ic_addpic.png",
         viewclass: 'addBtn'
       })
     }
     this.setData({
       addbtnviews: temp
     });
  }
})