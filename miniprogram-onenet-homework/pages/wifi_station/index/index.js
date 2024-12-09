//index.js
//获取应用实例
const app = getApp()

Page({

  data: {
    motto: '这里将会是文字识别结果',
    tempFilePaths: null,
  },

  onLoad: function () {
    wx.showModal({
      title: '验证口令',
      content: '请上传一张写有 HELLO WORLD 的图片，识别成功则绘制天气曲线。'
    })
  },
  //确定图片来源，从相册中选择或者是拍照
  chooseImage: function () {
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#CED63A",
      success: (res) => {
        if (res.cancel) {
          return;
        }
        if (res.tapIndex == 0) {
          this.chooseWxImage('album')
        } else if (res.tapIndex == 1) {
          this.chooseWxImage('camera')
        }
      }
    })

  },

  //选择图片
  chooseWxImage: function (type) {
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: (res) => {
        this.setData({
          tempFilePaths: res.tempFilePaths,
        })
      }
    })
  },

  //上传图片至服务器并接受返回的结果
  identifyImage: function () {
    if(!this.data.tempFilePaths) {
      console.error("no selected image")
      return ;
    }
    /**
     * 调用微信上传文件接口, 此处向我们的本地服务器发送请求, 故运行此代码时要确保本地服务已经启动
     */
    wx.uploadFile({
      url: 'http://127.0.0.1:8000', //本地服务器的地址
      filePath: this.data.tempFilePaths[0],
      name: 'image',
      header: { "Content-Type": "multipart/form-data" },
      success: (res) => {
        console.log("返回识别结果：", res.data)
        //var data = JSON.parse(res.data) //把返回结果解析成json格式
        var data = res.data
        console.log("返回识别结果：", data)
        if (data.code === -9021) {
          wx.showModal({
            title: '上传成功',
            content: `但是没识别出来东西, 飞哥说可以问腾讯云, 或者换张图`
          })
          return ;
        }
        /* if (data.code !== 0) {
          //识别失败，提示上传质量更好的图片
          wx.showModal({
            title: '上传失败',
            content: `${data.message}`
          })
          return;
        } */
        //识别成功，拼接识别结果并显示
        //var list = data.data.items;
        //var str = list.map(i => i.itemstring).join(" ");
        console.log("123")
        var str= data;
        console.log("456")
        this.setData({
          motto: str
        })
        let processedStr = str.toLowerCase().replace(/\s/g, ''); //去掉字符串中所有空格并转换为小写字母
        if (processedStr !== 'helloworld') {
          wx.showModal({
            title: '提示',
            content: '图片中的文字不是"HELLOWORLD", 而是 ' + processedStr
          })
          return;
        }
        wx.navigateTo({
          url: "../tianqi/tianqi"
        })
      },
      fail: (err) => {
        console.error(err)
      }
    })
  }
})
