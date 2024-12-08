## OneNet - Ardinuo部分代码示例

ESP8266是WiFi模块，负责将Arduino上传感器采集到的温湿度信息传输到OneNet服务器上。

### 引脚定义

![](https://www.oursparkspace.cn/wp-content/uploads/2019/11/wifi模块.jpg)

| 名称  | 说明                                      |
| ----- | ----------------------------------------- |
| TX    | 串口写，**接Arduino D3接口（不接TX->1）** |
| GND   | 接地，接Arduino GND                       |
| CH_PD | 高电平可用，低电平关机，接Arduino 3.3V    |
| GPIO2 | 悬空                                      |
| RST   | 重置，悬空                                |
| GPIO0 | 上拉为工作模式，下拉为下载模式，悬空      |
| VCC   | 供电，接Arduino 3.3V。**不可接5V！**      |
| RX    | 串口读，**接Arduino D2接口（不接RX->0）** |

### 电路示意图

![](http://www.oursparkspace.cn/wp-content/uploads/2020/10/电路图-800x532.png)

### 实际效果

![](http://www.oursparkspace.cn/wp-content/uploads/2020/10/结果-800x530.png)