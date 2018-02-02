//index.js
//获取应用实例
var util = require('../../utils/util.js');
var app = getApp();
var today = util.formatTime(new Date((new Date()).getTime()+(1000*60*60*24*7))).split(' ')[0];
var minday = util.formatTime(new Date()).split(' ')[0];
var maxday =  util.formatTime(new Date((new Date()).getTime()+(1000*60*60*24*62))).split(' ')[0];
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var page = 1;
var list = new Array();
var list1 = new Array();
var list2 = new Array();

Page({
  data: {
    all:'act',
    destination: ["潞城", "英国宫1期", "英国宫2期"],
    dateStr: ["今天", "明天"],
    timeZoneStr: ["全部", "最近30分钟", "30-2小时", "2-24小时"],
    timeZoneStrIndex: 0,
    dateStrIndex: 0,
    destinationXY: [[39.9090573776, 116.7540886291], [39.4547575590, 116.3144253176], [39.8792170855, 116.8531464547]],
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
    this.getList(e.detail.value,this.data.start,this.data.over);
  },

  bindTimeChange: function (e) {
    this.setData({
      timeZoneStrIndex: e.detail.value
    })
    this.getList(e.detail.value, this.data.start, this.data.over);
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
  },

  onShareAppMessage: function () {
    return {
      title: '大厂潞城约车',
      path: 'pages/index/index'
    }
  },
  getList:function(date='',start='',over=''){

    var that = this;
    util.req('info/lists',
      {start:start,over:over,date:date,page:page},
      function(data){
        if(!data.list){
          that.setData({nomore:true});
          return false;
        } 
        if(page == 1){          
          list = new Array();
          list1 = new Array();
          list2 = new Array();
        }
        var surp = new Array('','空位','人');
        data.list.forEach(function(item){
          try{
            var start = ((item.departure).split('市')[1]).replace(/([\u4e00-\u9fa5]+[县区]).+/, '$1');
          }catch(e){
            var start = (item.departure).split(/[县区]/)[0];
          }

          try {
            var over = ((item.destination).split('市')[1]).replace(/([\u4e00-\u9fa5]+[县区]).+/, '$1');
          } catch (e) {
            var over = (item.destination).split(/[县区]/)[0];
          }

          var obj = {
            start:start,
            over:over,
            type:that.data.tabs[item.type],
            tp:item.type,
            time:util.formatTime(new Date(item.time*1000)),
            surplus:item.surplus+surp[item.type],
            see:item.see,
            gender:item.gender,
            avatarUrl:item.avatarUrl,
            url:'/pages/info/index?id='+item.id,
            tm:util.getDateDiff(item.time*1000)
            };
            list.push(obj);
            if(item.type == 1){
              list1.push(obj);
            }else{
              list2.push(obj);
            }
        })

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

        console.info(latitude)
        console.info(longitude)

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
        console.info(minlos)
        console.info(minIndex)
        var lastEndIndex = wx.getStorageSync('lastEndIndex')
        if (!lastEndIndex){
          lastEndIndex=0
        }

        that.setData({
          startIndex: minIndex,
          endIndex: lastEndIndex
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
  onReachBottom:function(){
    if(!this.data.nomore){
      page++;
      this.getList(this.data.date,this.data.start,this.data.over);
    }
  }
})
