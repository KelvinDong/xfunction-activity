import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommandService {

   // 消息机制
   private messageSu = new Subject<number>(); //
   messageObserve = this.messageSu.asObservable();
  constructor() { }

  // 发送消息
  public setMessage(message: number) {
    this.messageSu.next(message);
   }
}
