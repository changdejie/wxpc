//app.js
var util = require('utils/util.js');
App({

  onLaunch: function () {
    var that = this;
    //小程序初始化先判断用户是否登录    
      wx.checkSession({
        success: function(){  
          wx.getStorage({  
            key: 'sk',
            success: function(res) {
                var sk = res.data;
                util.req('user/vaild_sk', { "sk": sk }, function (data) {
                  if (data.status == 1) {
                    that.globalData.sk = sk;
                  } else {
                    that.login();
                    return;
                  }
                })
            },
            fail:function() {
              that.login();
               return;
            }
          })

          wx.getStorage({  
            key: 'userInfo',
            success: function(res) {
                that.globalData.userInfo = res.data;
            },
            fail:function() {
              that.login();
            }
          });
        },
        fail: function(){
          //登录态过期
          that.login() //重新登录
        }
      })
    
  },

 
  login:function(){
    var that = this;
    wx.login({
      success: function (res) {
        wx.getUserInfo({
          success: function(userinfo){
            util.req('user/login', {
              "code": res.code,
              "encryptedData": userinfo.encryptedData,
              "iv": userinfo.iv
               }, function (data) {
                 that.setUserInfo(data.user);
                 that.setSk(data.sk);
            })
          },
          fail: function(res) {
            that.loginFail();
          }
        })
      }
    })
  } ,

  loginFail: function () {
    var that = this;
    wx.showModal({
        content: '登录失败，请允许获取用户信息,如不显示请删除小程序重新进入',
        showCancel: false
    });
    that.login();
  },
  setUserInfo:function(data){   //将用户信息缓存保存
    this.globalData.userInfo = data;
    wx.setStorage({
      key:"userInfo",
      data:data
    })
  },
  setSk:function(data){   //将用户信息缓存保存
    this.globalData.sk = data;
    wx.setStorage({
      key:"sk",
      data:data
    })
  },
  globalData:{
    userInfo: null,
    destination: ["潞城", "英国宫1期", "英国宫2期", "英国宫4期", "英国宫56期", "英国宫7期", "潮白馨居", "潮白一期", "潮白二期", "早安北京", "剑桥郡"],
    destinationXY: [[39.9090573776, 116.7540886291], [39.4547575590, 116.3144253176], [39.8792170855, 116.8531464547], [39.8721870855, 116.8540564547], [39.8792170855, 116.8531464547],[39.8965239163, 116.8493030406], [39.8728470855, 116.8556664547], [40.1085076350, 116.7640572423], [39.8651663307, 116.8624511873], [39.8529600000, 116.7784000000], [39.9140515694, 116.6423439873]],
    dateStr: ["今天", "明天"],
    sk:null
  }
  
})