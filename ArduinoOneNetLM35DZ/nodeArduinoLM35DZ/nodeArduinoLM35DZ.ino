#include "ESP8266.h"
#include "SoftwareSerial.h"

// 配置 ESP8266 WiFi 设置
#define SSID "xxxx"    // 填写2.4GHz的WiFi名称，不要使用校园网
#define PASSWORD "xxxx"   // 填写自己的WiFi密码
#define HOST_NAME "xxxx"  // 填写电脑上查询的ipv4地址
#define HOST_PORT 3000                // 服务器的端口 无须更改
#define INTERVAL_SENSOR 5000 // 定义传感器采样及发送时间间隔

// 定义 LM35D 接入 Arduino 的管脚
#define LM35PIN A0

// 定义 ESP8266 所连接的软串口
SoftwareSerial mySerial(3, 2); // ESP8266 连接到 D3 和 D2
ESP8266 wifi(mySerial);

void setup() {
  mySerial.begin(115200);  // 初始化软串口
  Serial.begin(9600);      // 初始化串口
  Serial.print("setup begin\r\n");

  // 以下为 ESP8266 初始化的代码
  Serial.print("FW Version: ");
  Serial.println(wifi.getVersion().c_str());

  if (wifi.setOprToStation()) {
    Serial.print("to station ok\r\n");
  } else {
    Serial.print("to station err\r\n");
  }

  // ESP8266 接入 WiFi
  if (wifi.joinAP(SSID, PASSWORD)) {
    Serial.print("Join AP success\r\n");
    Serial.print("IP: ");
    Serial.println(wifi.getLocalIP().c_str());
  } else {
    Serial.print("Join AP failure\r\n");
  }


  mySerial.println("AT+UART_CUR=9600,8,1,0,0");
  mySerial.begin(9600);
  Serial.println("setup end\r\n");
}


unsigned long net_time1 = millis(); // 数据上传服务器时间

void loop() {
  if (net_time1 > millis())
    net_time1 = millis();

  if (millis() - net_time1 > INTERVAL_SENSOR) { // 发送数据时间间隔
    // 读取 LM35D 传感器温度值
    int sensorValue = analogRead(LM35PIN); // 读取传感器值
    float voltage = sensorValue * (5.0 / 1023.0); // 转换为电压值
    float temperature = voltage * 100; // 转换为温度值，LM35D 每十分一为1度

    Serial.print("Temperature (oC): ");
    Serial.println(temperature, 2);

    if (wifi.createTCP(HOST_NAME, HOST_PORT)) { // 建立TCP连接，如果失败，不能发送该数据
      Serial.print("create tcp ok\r\n");

      // 构建 JSON 数据
      char buf[10];
      String jsonToSend = "{";

      // 拼接温度数据
      jsonToSend += "\"temperature\":";
      dtostrf(temperature, 1, 2, buf);  // 将温度值转换为字符串
      jsonToSend += String(buf);
      jsonToSend += "}";  // 结束 JSON 数据

      // 打印构造的 JSON 数据
      Serial.println(jsonToSend);

      // 拼接 POST 请求字符串
      String postString = "POST /api/data HTTP/1.1";  
      postString += "\r\n";
      postString += "Host: " + String(HOST_NAME) + "\r\n";
      postString += "Content-Type: application/json\r\n";
      postString += "Content-Length: " + String(jsonToSend.length()) + "\r\n";
      postString += "\r\n";
      postString += jsonToSend;  // 添加 JSON 数据到请求体

      const char *postArray = postString.c_str();  // 将字符串转为字符数组

      wifi.send((const uint8_t *)postArray, strlen(postArray));  // 发送请求
      Serial.println(postArray);  // 打印发送的请求
      Serial.println("send success");

      if (wifi.releaseTCP()) {  // 释放 TCP 连接
        Serial.print("release tcp ok\r\n");
      } else {
        Serial.print("release tcp err\r\n");
      }

      postArray = NULL;  // 清空数组，等待下次传输数据
    } else {
      Serial.print("create tcp err\r\n");
    }

    Serial.println("");
    net_time1 = millis();  // 更新时间
  }
}
