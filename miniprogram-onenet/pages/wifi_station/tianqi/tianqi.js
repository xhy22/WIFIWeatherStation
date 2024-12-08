var myCharts = require("../../../utils/wxcharts.js")//引入一个绘图的插件


Page({
  data: {},

  /**
   * @description 页面下拉刷新事件
   */
  onPullDownRefresh: function () {
    wx.showLoading({
      title: "正在获取"
    })
    this.getDatapoints().then(datapoints => {
      this.update(datapoints)
      wx.hideLoading()
    }).catch((error) => {
      wx.hideLoading()
      console.error(error)
    })
  },

  /**
   * @description 页面加载生命周期
   */
  onLoad: function () {


    //每隔6s自动获取一次数据进行更新
    const timer = setInterval(() => {
      this.getDatapoints().then(datapoints => {
        this.update(datapoints)
      })
    }, 5000)

    wx.showLoading({
      title: '加载中'
    })

    this.getDatapoints().then((datapoints) => {
      wx.hideLoading()
      this.firstDraw(datapoints)
    }).catch((err) => {
      wx.hideLoading()
      console.error(err)
      clearInterval(timer) //首次渲染发生错误时禁止自动刷新
    })
  },

  /**
   * 向OneNet请求当前设备的数据点
   * @returns Promise
   */
  getDatapoints: function () {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://iot-api.heclouds.com/thingmodel/query-device-property?product_id=产品id&device_name=设备名称`,
        header: {
          'content-type': 'application/json',
          'authorization': "鉴权"
        },
        success: (res) => {
          const response = res.data;
  
          // 提取温度和湿度数据
          const temperatureData = response.data.find(item => item.identifier === 'temperature');
          const humidityData = response.data.find(item => item.identifier === 'humidity');
          const temperature = temperatureData ? temperatureData.value : null;
          const humidity = humidityData ? humidityData.value : null;
    
          // 获取当前时间戳
          const timestamp = new Date().toISOString();
  
          // 累积温度数据
          let tempData = this.data.temperatureData || [];
          tempData.push({ value: temperature, at: timestamp });
          this.setData({ temperatureData: tempData });
  
          // 累积湿度数据
          let humiData = this.data.humidityData || [];
          humiData.push({ value: humidity, at: timestamp });
          this.setData({ humidityData: humiData });
  
          // 返回累积数据
          resolve({
            temperature: tempData,
            humidity: humiData
          });
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },
  
  
 

  /**
   * @param {Object[]} datapoints 从OneNet云平台上获取到的数据点
   * 传入获取到的数据点, 函数自动更新图标
   */
  update: function (datapoints) {
    const wheatherData = this.convert(datapoints);

    this.lineChart_hum.updateData({
      categories: wheatherData.categories,
      series: [{
        name: 'humidity',
        data: wheatherData.humidity,
        format: (val, name) => val.toFixed(2)
      }],
    })

    this.lineChart_tempe.updateData({
      categories: wheatherData.categories,
      series: [{
        name: 'tempe',
        data: wheatherData.tempe,
        format: (val, name) => val.toFixed(2)
      }],
    })

  },

  /**
   * 
   * @param {Object[]} datapoints 从OneNet云平台上获取到的数据点
   * 传入数据点, 返回使用于图表的数据格式
   */
  convert: function (datapoints) {
    var categories = [];
    var humidity = [];
    var tempe = [];

    var length = datapoints.humidity.length
    for (var i = 0; i < length; i++) {
      categories.push(datapoints.humidity[i].at.slice(5, 19));
      humidity.push(datapoints.humidity[i].value);
      tempe.push(datapoints.temperature[i].value);
    }
    return {
      categories: categories,
      humidity: humidity,
      tempe: tempe
    }
  },

  /**
   * 
   * @param {Object[]} datapoints 从OneNet云平台上获取到的数据点
   * 传入数据点, 函数将进行图表的初始化渲染
   */
  firstDraw: function (datapoints) {

    //得到屏幕宽度
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    var wheatherData = this.convert(datapoints);

    //新建湿度图表
    this.lineChart_hum = new myCharts({
      canvasId: 'humidity',
      type: 'line',
      categories: wheatherData.categories,
      animation: false,
      background: '#f5f5f5',
      series: [{
        name: 'humidity',
        data: wheatherData.humidity,
        format: function (val, name) {
          return val.toFixed(2);
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: 'humidity (%)',
        format: function (val) {
          return val.toFixed(2);
        }
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });

    //新建温度图表
    this.lineChart_tempe = new myCharts({
      canvasId: 'tempe',
      type: 'line',
      categories: wheatherData.categories,
      animation: false,
      background: '#f5f5f5',
      series: [{
        name: 'temperature',
        data: wheatherData.tempe,
        format: function (val, name) {
          return val.toFixed(2);
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: 'temperature (摄氏度)',
        format: function (val) {
          return val.toFixed(2);
        }
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },
})
