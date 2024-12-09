const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');  // 引入 axios 库

const app = express();
const port = 3000;  // 你可以设置任何未被占用的端口


// 使用 body-parser 中间件来解析 JSON 和 URL 编码的请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// POST 请求处理
app.post('/api/data', (req, res) => {
  // 获取 POST 请求体中的数据
  const data = req.body;

  // 打印接收到的数据
  console.log('Received data:', data);

  // OneNET 平台的 API 地址
  const onenetApiUrl = 'https://open.iot.10086.cn/fuse/http/device/thing/property/post?topic=$sys/产品id/设备名称/thing/property/post&protocol=HTTP';

  // 创建请求头，OneNET API 要求传入授权的 API Key
  const headers = {
    'Content-Type': 'application/json',
    'token': 'token值'  // 替换为你自己的 OneNET API Key
  };

  // 构造发送到 OneNET 的数据
  const jsonData = 
    
        {"id":"123","params":{"temperature":{"value":data.temperature},"humidity":{"value":data.humidity}}}
    
  ;

  // 使用 axios 向 OneNET 发送 HTTPS 请求
  axios.post(onenetApiUrl, jsonData, { headers })
    .then((response) => {
      console.log('Data sent to OneNET:', response.data);  // 输出 OneNET 返回的响应
      // 发送响应给客户端
      res.status(200).send('Data received and sent to OneNET successfully');
    })
    .catch((error) => {
      console.error('Error sending data to OneNET:', error);
      // 发送错误响应给客户端
      res.status(500).send('Error sending data to OneNET');
    });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
