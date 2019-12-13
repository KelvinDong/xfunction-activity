import {Injectable} from '@angular/core';
import {interval, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  messageSubject;                                 // subject对象,用于发送事件
  private url;                                    // 默认请求的url
  private webSocket: WebSocket;                   // websocket对象
  connectSuccess = false;                         // websocket 连接成功
  period = 60 * 1000 * 10;                        // 10分钟检查一次
  serverTimeoutSubscription = null;               // 定时检测连接对象
  reconnectFlag = false;                          // 重连
  reconnectPeriod = 5 * 1000;                     // 重连失败,则5秒钟重连一次
  reconnectSubscription = null;                   // 重连订阅对象
  runTimeSubscription;                            // 记录运行连接subscription
  runTimePeriod = 60 * 10000;                     // 记录运行连接时间

  constructor() {
    this.messageSubject = new Subject();
    console.log('开始心跳检测');
    this.heartCheckStart();
    this.calcRunTime();
  }

  sendMessage(message) {
    this.webSocket.send(message);
  }

  connect(url) {
    if (!!url) {
      this.url = url;
    }
    this.createWebSocket();
  }


  createWebSocket() {
    // 如果没有建立过连接，才建立连接并且添加时间监听
    this.webSocket = new WebSocket(this.url);
    // 建立连接成功
    this.webSocket.onopen = (e) => this.onOpen(e);
    // 接收到消息
    this.webSocket.onmessage = (e) => this.onMessage(e);
    // 连接关闭
    this.webSocket.onclose = (e) => this.onClose(e);
    // 异常
    this.webSocket.onerror = (e) => this.onError(e);
  }

  onOpen(e) {
    console.log('websocket 已连接');
    this.connectSuccess = true;
    if (this.reconnectFlag) {
      // 1.停止重连
      this.stopReconnect();
      // 2.重新开启心跳
      this.heartCheckStart();
      // 3.重新开始计算运行时间
      this.calcRunTime();
    }
  }

  onMessage(event) {
    console.log('接收到的消息', event.data);
    const message = JSON.parse(event.data);
    // console.log('接收到消息时间', new Date().getTime());
    this.messageSubject.next(message);
  }

  private onClose(e) {
    console.log('连接关闭', e);
    this.connectSuccess = false;
    this.webSocket.close();
    // 关闭时开始重连
    this.reconnect();
    this.stopRunTime();
    // throw new Error('webSocket connection closed:)');
  }


  private onError(e) {
    // 出现异常时一定会进onClose,所以只在onClose做一次重连动作
    console.log('连接异常', e);
    this.connectSuccess = false;
    // throw new Error('webSocket connection error:)');
  }

  reconnect() {
    // 如果已重连,则直接return,避免重复连接
    if (this.connectSuccess) {
      this.stopReconnect();
      console.log('已经连接成功,停止重连');
      return;
    }
    // 如果正在连接中,则直接return,避免产生多个轮训事件
    if (this.reconnectFlag) {
      console.log('正在重连,直接返回');
      return;
    }
    // 开始重连
    this.reconnectFlag = true;
    // 如果没能成功连接,则定时重连
    this.reconnectSubscription = interval(this.reconnectPeriod).subscribe(async (val) => {
      console.log(`重连:${val}次`);
      const url = this.url;
      // 重新连接
      this.connect(url);
    });
  }


  stopReconnect() {
    // 连接标识置为false
    this.reconnectFlag = false;
    // 取消订阅
    if (typeof this.reconnectSubscription !== 'undefined' && this.reconnectSubscription != null) {
      this.reconnectSubscription.unsubscribe();
    }
  }

 
  heartCheckStart() {
    this.serverTimeoutSubscription = interval(this.period).subscribe((val) => {
      // 保持连接状态,重置下
      if (this.webSocket != null && this.webSocket.readyState === 1) {
        console.log(val, '连接状态，发送消息保持连接');
      } else {
        // 停止心跳
        this.heartCheckStop();
        // 开始重连
        this.reconnect();
        console.log('连接已断开,重新连接');
      }
    });
  }

  heartCheckStop() {
    // 取消订阅停止心跳
    if (typeof this.serverTimeoutSubscription !== 'undefined' && this.serverTimeoutSubscription != null) {
      this.serverTimeoutSubscription.unsubscribe();
    }
  }

  calcRunTime() {
    this.runTimeSubscription = interval(this.runTimePeriod).subscribe(period => {
      console.log('运行时间', `${period}分钟`);
    });
  }

  stopRunTime() {
    if (typeof this.runTimeSubscription !== 'undefined' && this.runTimeSubscription !== null) {
      this.runTimeSubscription.unsubscribe();
    }
  }
}