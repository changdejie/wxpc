// pages/info/add.js
var util = require('../../utils/util.js');  
var app = getApp();
var today = util.formatTime(new Date((new Date()).getTime() )).split(' ')[0];
var minday = util.formatTime(new Date()).split(' ')[0];
var maxday =  util.formatTime(new Date((new Date()).getTime()+(1000*60*60*24*62))).split(' ')[0];
Page({
  data:{
    sex: ['请选择性别','男','女'],
    type: 1,
    prices: ['请选择价格', 5, 6,7,8,9,10],
    priceIndex:2,
    gender:0,
    date:today,
    start: minday,
    end:maxday,
    time: util.formatTime(new Date((new Date()).getTime() + (1000 * 60 * 30))).split(' ')[1],
    types: [{ name: '1', value: '车找人', checked: true }, { name: '2', value: '人找车' }],
    isAllTypes: [{ name: '1', value: '所有小区', checked: true },{name: '2', value: '排除'},{name: '3', value: '路过'}],
    Surpluss:['请选择',1,2,3,4,5,6,7,8],
    surplus: 4,
    price:6,
    isAgree: false,
    vehicle:'',
    destinations: getApp().globalData.destination,
    endIndex:-1,
    departure: '出发地',
    type:1,
    destination:'目的地'
  },
  setSex:function(e){
    this.setData({gender:e.detail.value})
  },
  bindDateChange:function(e){
    this.setData({
        date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
      this.setData({
          time: e.detail.value
      })
  },
  bindPriceChange: function (e) {
    this.setData({
      priceIndex: e.detail.value
    })
  },
  selectType:function(e){
    this.setData({type:e.detail.value})
  },
  setsurplus:function(e){
    this.setData({surplus:e.detail.value})
  },
  bindAgreeChange: function (e) {
      this.setData({
          isAgree: !!e.detail.value.length
      });
  },
  formSubmit:function(e){
    var data = e.detail.value;
    var that = this;
  

    if(data.name == ''){
      util.isError('请输入姓名', that);
      return false;
    }
    if(data.gender == 0){
      util.isError('请选择性别', that);
      return false;
    }

    if(data.phone == ''){
      util.isError('请输入手机号码', that);
      return false;
    }

    if(!(/^1[34578]\d{9}$/.test(data.phone))){
      util.isError('手机号码错误', that);
      return false;
    }

    //默认赋给最近的地址
    data.departure = getApp().globalData.destination[wx.getStorageSync('startIndex')];
    data.destination = getApp().globalData.destination[wx.getStorageSync("add_endIndex")];

    if(data.departure == '出发地'){
      util.isError('请选择出发地', that);
      return false;
    }

    if (this.data.endIndex == -1 || data.destination == ''){
      util.isError('请选择目的地', that);
      return false;
    }
    if(data.time == '请选择时间'){
      util.isError('请选择出发时间', that);
      return false;
    }
    if(data.surplus == '0'){
      var arr = new Array('','剩余空位','乘车人数');
      // util.isError('请选择' + arr[data.type], that);
      util.isError('请选择剩余空位',that);
      return false;
    }

    
    if(!data.isAgree[0]){
      util.isError('请阅读并同意条款',that);
      return false;
    }
    data.sk = app.globalData.sk;
    util.req('info/add',data,function(data){
      if(data.status == 1){
        wx.redirectTo({
          url: '/pages/info/index?id='+data.info
        });
      }else{
        util.isError(data.msg,that);
        return false;
      }
    })
    util.clearError(that);
  },


  selectStart: function (e) {
    this.setData({
      'startIndex': e.detail.value
    })
  },

  selectEnd: function (e) {
    this.setData({
      'endIndex': e.detail.value
    })
    //如果不是潞城设置
    if (e.detail.value != 0){
      wx.setStorageSync("last_endIndex", e.detail.value)
    }
    
  },

  sexDeparture:function(){
    var that = this;
    wx.chooseLocation({
      success:function(res){
        that.setData({
          departure:res.address
        })
      }
    })
  },
  sexDestination:function(){
    var that = this;
    wx.chooseLocation({
      success:function(res){
        that.setData({
          destination:res.address
        })
      }
    })
  },
  onLoad:function(options){
    this.setData({

      gender: app.globalData.userInfo ? app.globalData.userInfo.gender : "",
      name: app.globalData.userInfo ? (app.globalData.userInfo.name == "" ? app.globalData.userInfo.nickname : ""):"",
      phone: app.globalData.userInfo ?app.globalData.userInfo.phone:"",
      startIndex: wx.getStorageSync("startIndex"),
      endIndex: wx.getStorageSync("startIndex") == 0 ? wx.getStorageSync("last_endIndex"):0,
      vehicle: app.globalData.userInfo ?app.globalData.userInfo.vehicle:""
    })
  }
})