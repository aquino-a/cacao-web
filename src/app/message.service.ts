import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Client, IFrame } from "@stomp/stompjs";
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { AuthenticationService } from './authentication.service';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  
  private stompClient: Client;

  private messages = new Map<string, Messages>();

  private newMessageSource = new BehaviorSubject<Message>(null);
  newMessage$ = this.newMessageSource.asObservable();

  private disconnectedSource = new BehaviorSubject<any>(null);
  disconnected$ = this.disconnectedSource.asObservable();

  private connectedSource = new BehaviorSubject<any>(null);
  connected$ = this.connectedSource.asObservable();

  
  constructor(private auth: AuthenticationService, private http: HttpClient) {
    this.setupAuthenticationEvents();
  }
  
  setupAuthenticationEvents() {
    this.auth.userLoginSuccess$.subscribe({next: user => this.createStompClient()});
    this.auth.userLoginFail$.subscribe({next: nothing => { this.stompClient.forceDisconnect();}});
  }

  createStompClient(): void {
    if(!this.auth.isAuthenticated())
      return;
      
    this.stompClient = new Client({
        debug: function (str) {
          console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        webSocketFactory: () => new SockJS(environment.baseUrl + '/api/ws?access_token=' + this.auth.tokens.idToken)
      });

    this.stompClient.onConnect = this.onConnect;
    this.stompClient.onStompError = this.onStompError;
    this.stompClient.onWebSocketClose = this.onClose;
    
    this.stompClient.activate();
  }

  onConnect = (frame: IFrame) => {
    console.log('Connected: ' + frame);
    this.setConnected(true);
    this.stompClient.subscribe('/user/api/topic/message', this.processNewMessage);
    this.connectedSource.next({});
  }

  onStompError = (frame: IFrame) => {
      // Will be invoked in case of error encountered at Broker
      // Bad login/passcode typically will cause an error
      // Complaint brokers will set `message` header with a brief message. Body may contain details.
      // Compliant brokers will terminate the connection after any error
      console.log('Broker reported error: ' + frame.headers['message']);
      console.log('Additional details: ' + frame.body);
  }

  onClose = (evt: CloseEvent) => {
    this.disconnectedSource.next({});
  }

  processNewMessage = (data: any) => {
    const message = JSON.parse(data.body, this.messageParse) as Message;
    
    this.newMessageSource.next(message);
    const chatId = this.getChatId(message);
    if(this.messages.has(chatId)){
      var ms = this.messages.get(chatId);
      if(ms.messageIds.has(message.id)){
        return;
      }
      ms.messages.push(message);
      ms.messageIds.add(message.id);
    }
    else this.messages.set(chatId, {messages: [message], messageIds: new Set<string>().add(message.id) });
  }

  getChatId(message: Message): string {
    if(message.fromUser == this.auth.currentUser.id){
      return message.toUser;
    } else {
      return message.fromUser;
    }
  }

  messageParse(key: any, value: any) {
    if(key == 'time'){
      return new Date(value + 'Z');
    }
    return value;
  }

  setConnected(isConnected: boolean) {
    if(isConnected)
      console.log('Connected');
  }
  
  fetchMessages(chatId: string): Observable<Message[]> {
    if(this.messages.has(chatId)){
      const ms = this.messages.get(chatId);
      if(!ms.messages.every(m => !m.wasRead)){
        return of(ms.messages);
      }
    }

    const options = { 
      params: 
        new HttpParams()
          .set("userId2", chatId)
          .set("earlierThan", (new Date()).toISOString())
          
    };
    const ob = this.http.get<Message[]>(environment.baseUrl + "/api/message", options);

    const pipedOb = ob.pipe(map(ms => {
      ms.forEach(m =>
      {
        m.time = new Date(m.time + 'Z');
      });
      this.setMessages(chatId, ms);
      return this.messages.get(chatId).messages;
    }));
    return pipedOb;
  }

  setMessages(chatId: string, ms: Message[]) {
    var messages = this.messages.get(chatId);

    if(messages == null || messages == undefined){
      messages = {messages: ms, messageIds: new Set<string>(ms.map(m => m.id)) };
    }
    else {
      messages.messages.length = 0;
      messages.messages.push(...ms);
      messages.messageIds = new Set<string>(ms.map(m => m.id));
    }

    this.messages.set(chatId, messages);
  }

  send(toUser: string, newMessage: string) {
    var message = {
      toUser: toUser,
      message: newMessage
    };

    var params = {
      destination: "/api/app/message/send",
      body: JSON.stringify(message)
    };

    this.stompClient.publish(params);
  }

  readMessage(message: Message) {
    var params = {
      destination: "/api/app/message/read",
      body: message.id
    };
    this.stompClient.publish(params);
    message.wasRead = true;
  }

  unreadMessageCount(user: User): number {
    const messages = this.messages.get(user.id);
    
    if(messages == null || messages == undefined){
      return 0;
    }
    return messages.messages.filter(m => !m.wasRead && m.fromUser == user.id).length;
  }

  isDuplicateMessage(chatId: string, messageId: string): boolean {
    const messages = this.messages.get(chatId);
    
    if(messages == null || messages == undefined){
      return false;
    }

    return messages.messageIds.has(messageId);
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

interface Messages {
  messages: Message[];
  messageIds: Set<string>;
}
