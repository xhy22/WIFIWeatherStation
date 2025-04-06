// start.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled: true,
    threshold: 0,
    rule: 'up',
    items: [
      { name: 'up', value: '高于门限报警', checked: 'ture' },
      { name: 'down', value: '低于门限报警' },
    ]
  },

  radioChange: function (e) {
    //保存报警规则到当前页面的数据
    if (e.detail.value != "") {
      this.setData({
        rule: e.detail.value
      })
    }
  },

  send: function () {
    var that = this
    //取得门限数据和报警规则

    //调用百度天气API
    // 就是这里需要改动

    var theBaiDuAPPkey = "XXXX" //百度的APPkey
    var district_id = "110108"  //天气查询的区域编码,如110108，具体请参考百度的api文档说明

    const requestTask = wx.request({
      url: `https://api.map.baidu.com/weather/v1/?district_id=${district_id}&data_type=all&ak=${theBaiDuAPPkey}`, //百度天气API
      header: {
        'content-type': 'application/json',
      },

      success: function (res) {
        console.log(res.data)
        var tmp = res.data.result.now.temp

        //温度高于设置的门限值
        if (tmp > that.data.threshold) {
          if (that.data.rule == "up") {
            //规则为高于门限报警，于是报警
            wx.showModal({
              title: '警报！',
              content: `当前温度${tmp}度,高于设定值${that.data.threshold}`
            })
          }
          //规则为低于门限报警，于是不报警
          else if (that.data.rule == "down") {
            wx.showModal({
              title: '提示～',
              content: `当前温度${tmp}度,温度处于正常范围`
            })
          }
        }
        //温度低于设置的门限值
        else if (tmp <= that.data.threshold) {
          //规则为高于门限报警，于是不报警
          if (that.data.rule == "up") {
            wx.showModal({
              title: '提示～',
              content: `当前温度${tmp}度,温度处于正常范围`
            })
          }
          //规则为低于门限报警，于是报警
          else if (that.data.rule == "down") {
            wx.showModal({
              title: '警报！',
              content: `当前温度${tmp}度, 低于设定值${that.data.threshold}`
            })
          }
        }
      },

      fail: function (res) {
        console.log("fail!!!")
      },

      complete: function (res) {
        console.log("end")
      }
    })
  },

  //跳转到图片识别的口令验证页面
  validate: function () {
    wx.navigateTo({
      url: '../wifi_station/index/index',
    })
  },



  change: function (e) {
    //当有输入时激活发送按钮，无输入则禁用按钮
    if (e.detail.value != "") {
      this.setData({
        threshold: e.detail.value,
        disabled: false,
      })
    } else {
      this.setData({
        threshold: 0,
        disabled: true,
      })
    }
  }
})
