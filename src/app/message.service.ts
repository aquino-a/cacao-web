import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { over } from "@stomp/stompjs";
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  
  private stompClient; 

  private messages = new Map<string, Message[]>();

  private newMessageSource = new BehaviorSubject<Message>(null);
  newMessage$ = this.newMessageSource.asObservable();
  
  constructor(private auth: AuthenticationService, private http: HttpClient) {
  }
  
  setupAuthenticationEvents() {
    this.auth.userLoginSuccess$.subscribe({next: user => this.createStompClient()});
    this.auth.userLoginFail$.subscribe({next: nothing => this.stompClient = null});
  }

  createStompClient(): void {
    if(!this.auth.isAuthenticated())
      return;

    const socket = new SockJS(environment.baseUrl + '/api/ws');
    this.stompClient = over(socket);

    this.stompClient.connect({}, (frame) =>{
      console.log('Connected: ' + frame);
      this.setConnected(true);
      this.stompClient.subscribe('/user/api/topic/message', this.processNewMessage);
    });
  }

  processNewMessage(arg0: string, data: any) {
    const message = JSON.parse(data.body) as Message;

    this.newMessageSource.next(message);

    if(this.messages.has(message.fromUser))
      this.messages.get(message.fromUser).push(message);
    else this.messages.set(message.fromUser, [message]);
  }

  setConnected(isConnected: boolean) {
    if(isConnected)
      console.log('Connected');
  }
  
  fetchMessages(chatId: string): Observable<Message[]> {
    if(this.messages.has(chatId))
      return of(this.messages.get(chatId));

    const options = { 
      params: 
        new HttpParams()
          .set("userId2", chatId)
          .set("earlierThan", Date.now.toString())
    };
    var ob = this.http.get<Message[]>(environment.baseUrl + "/api/message", options);

    ob.subscribe(messages => this.messages.set(chatId, messages));
    return ob;
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
