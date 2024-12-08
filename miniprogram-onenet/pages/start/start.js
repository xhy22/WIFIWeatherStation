// start.js

Page({
    data: {

    },
    //跳转到天气页面
    navigate: function() {
        wx.navigateTo({
            url: '../wifi_station/tianqi/tianqi',
        })
    }
})