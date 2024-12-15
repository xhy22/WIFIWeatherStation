const express = require('express');
const app = express();
const fs = require('fs');
const ImageClient = require('./libs/BaseService');
const formidable = require('formidable');

// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require("tencentcloud-sdk-nodejs");
const OcrClient = tencentcloud.ocr.v20181119.Client;
console.log(OcrClient)
//POST请求的包体解析器
const bodyParser = require('body-parser');
//app.use(bodyParser());
app.use(express.json());

//const { AppId, SecretId, SecretKey } = require("./key.json")


// 实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
// 代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考，建议采用更安全的方式来使用密钥，请参见：https://cloud.tencent.com/document/product/1278/85305
// 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
const clientConfig = {
  credential: {
    secretId: "xxxx",
    secretKey: "xxxx",
  },
  region: "ap-beijing",
  profile: {
    httpProfile: {
      endpoint: "ocr.tencentcloudapi.com",
    },
  },
};

app.post("/", (req, res, next) => {
    let form = new formidable.IncomingForm();
    //设置上传图片的存放路径，__dirname 是nodejs中的一个全局变量，它的值是当前文件所在的绝对路径，这一句意思是上传的图片放在当前程序文件所在目录下的upload目录。
    form.uploadDir = __dirname + "/upload"
  
    //解析上传过来的表单，上传文件存在回调函数的files参数里
    form.parse(req, function (error, fields, files) {
  console.log(files.image.path)
  //console.log("sadad",fs.createReadStream(files.image.path))
// 实例化要请求产品的client对象,clientProfile是可选的
const client = new OcrClient(clientConfig);
console.log(client)

// 读取图片文件
let imageBase64;
try {
  imageBase64 = fs.readFileSync(files.image.path, "base64");
} catch (err) {
  console.error(`Failed to read image file: ${err.message}`);
  return;
}

// 设置请求参数
const params = {
     ImageBase64: imageBase64, //设置图片数据
    //"ImageUrl":"D:\Helloworld.jpg" 
};
client.GeneralAccurateOCR(params).then(
  (result) => {
    console.log('nodejs send the image successfully')
    //console.log(result.body)
    console.log("Tencent OCR API识别结果：")
    console.log(result)
    console.log(result.TextDetections[0].DetectedText)
    res.end(result.TextDetections[0].DetectedText)
  },
  (err) => {
    console.error("error", err);
  }
);
});
});
  
  //处理所有未匹配的请求
  app.use((req, res, next) => {
    res.end("0");
  });
  
  //监听8000端口
  const port = 8000;
  app.listen(port);
  
  console.log(`Server listening at http://127.0.0.1:${port}`);


