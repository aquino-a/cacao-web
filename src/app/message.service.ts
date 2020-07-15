import { Injectable, EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  
  newMessage = new EventEmitter<Message>();
  private messages = new Map<string, Message[]>().set('1', [{id: '8W8W', message: 'here\'s johnnie',time: new Date('2020-07-13T10:43:28.7500592'),fromUser: '123', toUser:'1444',wasRead:true }]);
  
  constructor() { }
  
  fetchMessages(chatId: string): Observable<Message[]> {
    return of(this.messages.get('1'));
  }
  
  
  

}

export interface Message {
  id: string;
  fromUser: string;
  toUser: string;
  message: string;
  time: Date;
  wasRead: boolean;
}
