//index.js
//获取应用实例
var util = require('../../utils/util.js');
var app = getApp();
var today = util.formatTime(new Date((new Date()).getTime())).split(' ')[0];
var minday = util.formatTime(new Date()).split(' ')[0];
var maxday =  util.formatTime(new Date((new Date()).getTime()+(1000*60*60*24*62))).split(' ')[0];
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var page = 1;
var list = new Array();
var list1 = new Array();
var list2 = new Array();

Page({
  data: {
    all: 'act',
    destination: getApp().globalData.destination,
    dateStr: ["今天", "明天"],
    // timeZoneStr: ["全部", "最近30分钟", "30-2小时", "2-24小时"],
    timeZoneStr: ["全部"],
    timeZoneStrIndex: 0,
    dateStrIndex: 0,
    destinationXY: getApp().globalData.destinationXY,
    date:today,
    minday:today,
    maxday:maxday,
    tabs: ["全部", "车找人", "人找车"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    start: '',
    endIndex: 0,
    time: util.formatTime(new Date()).split(' ')[1],
    over:''
  },

  tel: function () {
    
    wx.makePhoneCall({
      phoneNumber: app.globalData.userInfo.phone
    })
  },

  tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });
    },
  bindDateChange:function(e){
    this.setData({
      dateStrIndex: e.detail.value
    })
    page = 1;
    this.getList(e.detail.value,this.data.start,this.data.over);
  },

  bindTimeChange: function (e) {
    this.setData({
      timeZoneStrIndex: e.detail.value
    })
    page = 1;
    this.getList(e.detail.value, this.data.start, this.data.over);
  },

  selectStart: function (e) {
    this.setData({
      'startIndex': e.detail.value,
      'start': this.data.destination[e.detail.value]
    })
    page = 1;
    this.getList(this.data.date, this.data.start, this.data.over);
  },

  selectEnd: function (e) {
    this.setData({
      'endIndex': e.detail.value,
      'over': this.data.destination[e.detail.value]
    })
    page = 1;
    this.getList(this.data.date, this.data.start, this.data.over);
  },

  onShareAppMessage: function () {
    return {
      title: '大厂潞城约车',
      path: 'pages/index/index'
    }
  },
  getList:function(date='',start='',over=''){

    var that = this;

    if (that.data.dateStrIndex == 1) {
      date = util.formatTime(new Date((new Date()).getTime() + (1000 * 60 * 60 * 24))).split(' ')[0];
    } else if (that.data.dateStrIndex == 0){
      date = util.formatTime(new Date((new Date()).getTime())).split(' ')[0];
    }
   
    util.req('info/lists',
      {start:start,over:over,date:date,page:page},
      function(data){
      



        if(page == 1){          
          list = new Array();
          list1 = new Array();
          list2 = new Array();
        }

        if (!data.list) {
          that.setData({ nomore: true });
          // return false;
        } else{
          var surp = new Array('', '空位', '人');
          data.list.forEach(function (item) {
            // try{
            //   var start = ((item.departure).split('市')[1]).replace(/([\u4e00-\u9fa5]+[县区]).+/, '$1');
            // }catch(e){
            //   var start = (item.departure).split(/[县区]/)[0];
            // }

            // try {
            //   var over = ((item.destination).split('市')[1]).replace(/([\u4e00-\u9fa5]+[县区]).+/, '$1');
            // } catch (e) {
            //   var over = (item.destination).split(/[县区]/)[0];
            // }

            if (item.isAllTypes == 1) {
              item.isAllTypesMsg = "各个小区接送"
            } else if (item.isAllTypes == 2) {
              item.isAllTypesMsg = "不接送:" + item.isAllTypesValues
            } else if (item.isAllTypes == 3) {
              item.isAllTypesMsg = "仅接送:" + item.isAllTypesValues
            }

            var obj = {
              start: item.departure,
              id: item.id,
              over: item.destination,
              isAllTypesMsg: item.isAllTypesMsg,
              //只能约车
              type: 1,
              time: util.formatTime(new Date(item.time * 1000)),
              surplus: item.surplus,
              see: item.see,
              price: item.price,
              gender: item.gender,
              avatarUrl: item.avatarUrl,
              url: '/pages/info/index?id=' + item.id,
              tm: util.getDateDiff(item.time * 1000)
            };
            list.push(obj);
            // if(item.type == 1){
            //   list1.push(obj);
            // }else{
            //   list2.push(obj);
            // }
          })
        }

        that.setData({list:list,list1:list1,list2:list2});
    })

  },
  onPullDownRefresh: function(){
    page = 1;
    this.getList(this.data.date,this.data.start,this.data.over);
    wx.stopPullDownRefresh();
  },
  getstart:function(e){
    this.setData({
      start:e.detail.value
    })
    page = 1;
    this.getList(this.data.date,e.detail.value,this.data.over);
  },
  getover:function(e){
    this.setData({
      over:e.detail.value
    })
    page = 1;
    this.getList(this.data.date,this.data.start,e.detail.value);
  },
  onLoad: function () {
    var that = this;
    app = getApp()
  
    wx.getSystemInfo({
        success: function(res) {
            that.setData({
                sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
                windowHeight: res.windowHeight,
                windowWidth: res.windowWidth
            });
        }
    });

    wx.getLocation({
      success: function (res) { 
        var latitude = res.latitude
        var longitude = res.longitude  

        // console.info(latitude)
        // console.info(longitude)

        var minlos=10000000
        //记录循环index
        var index=0
        //记录最小 index
        var minIndex=0

        that.data.destinationXY.forEach(function (item) {
        
          var los = Math.pow((latitude - item[0]), 2) + Math.pow((longitude - item[1]), 2)
          if(los<minlos){
            minlos=los
            minIndex=index;
          }
          index++

        })
     
        //获取默认值
        var lastEndIndex = wx.getStorageSync('last_endIndex')
        wx.setStorageSync('startIndex', minIndex)
 

        //如果出发地是潞城，目的地不应该一样。
        //出发地不是潞城，目的地就是潞城
        if (minIndex == 0 && !lastEndIndex ){
          lastEndIndex=1
        } else if (minIndex != 0){
             wx.setStorageSync("last_endIndex", minIndex)
            lastEndIndex  =0
        }

        wx.setStorageSync("startIndex", minIndex)


        that.setData({
          startIndex: minIndex,
          endIndex: lastEndIndex,
          start: getApp().globalData.destination[minIndex],
          over: getApp().globalData.destination[lastEndIndex]
        })

        //进行加载
        that.getList(that.data.date, that.data.start, that.data.over);



        //最后初始化
        that.setData({
          'userinfoName': app.globalData.userInfo ? (app.globalData.userInfo.name == "" ? app.globalData.userInfo.nickname:""):"",
          'userinfoGender': app.globalData.userInfo ? app.globalData.userInfo.gender :"",
          'userinfoPhone': app.globalData.userInfo ? app.globalData.userInfo.phone :""
        })

        // wx.request({
        //   url: 'https://api.map.baidu.com/geocoder/v2/?ak=zIOkoO8wWrWA22ObIHPNkCgtLZpkP5lE&location=' + latitude + ',' + longitude + '&output=json&pois=0',
        //   data: {},
        //   method: 'GET', 
        //   header: { 'Content-Type': 'application/json' },
        //   success: function(res){
        //     that.setData({
        //       start:res.data.result.addressComponent.city
        //     })
        //     that.getList(that.data.date,res.data.result.addressComponent.city);
        //   }
        // })
      }
    })


  },

//预约相关
  bindAgreeChange: function (e) {
    this.setData({
      isAgree: !!e.detail.value.length
    });
  },
  madal: function (e) {
    console.log(e.target)
    var Surpluss = new Array('请选择人数');
    for (var i = 1; i <= e.target.dataset.surplus; i++) {
      Surpluss.push(i);
    }
    this.setData({ 
      Surpluss: Surpluss,
      surplus: 1,
      cdataid: e.target.dataset.id,
      modalFlag: true
     });

  },
  modalOk: function () {
    util.clearError( this);
    this.setData({ modalFlag: false });
  },
  appointment: function (e) {
    var fId = e.detail.formId;
    var that = this;
    console.log(e.detail.value.surplus);
    if (e.detail.value.name == '') {
      util.isError('请输入姓名', that);
      return false;
    }
    if (e.detail.value.phone == '') {
      util.isError('请输入手机号', that);
      return false;
    }
    if (!(/^1[34578]\d{9}$/.test(e.detail.value.phone))) {
      util.isError('手机号码错误', that);
      return false;
    }
    if (e.detail.value.surplus == 0) {
      util.isError('请选择人数', that);
      return false;
    }

    if (!e.detail.value.isAgree[0]) {
      util.isError('请阅读并同意条款', that);
      return false;
    }

    util.clearError(that);
    util.req('appointment/add', { form_id: fId, iid: this.data.cdataid, name: e.detail.value.name, phone: e.detail.value.phone, surplus: e.detail.value.surplus, sk: app.globalData.sk }, function (data) {
      if (data.status == 1) {
        that.setData({ modalFlag: false });
        wx.showToast({
          title: '预约成功,等待车主确认',
          icon: 'success',
          duration: 2000
        })
      } else {
        util.isError(data.msg, that);
        return false;
      }
    })
  },
  setsurplus: function (e) {
    this.setData({ surplus: e.detail.value })
  },



  onReachBottom:function(){
    if(!this.data.nomore){
      page++;
      this.getList(this.data.date,this.data.start,this.data.over);
    }
  }
})
