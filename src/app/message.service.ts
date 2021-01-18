import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { Client, IFrame } from "@stomp/stompjs";
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  
  private stompClient: Client;

  private messages = new Map<string, Message[]>();

  private newMessageSource = new BehaviorSubject<Message>(null);
  newMessage$ = this.newMessageSource.asObservable();
  
  constructor(private auth: AuthenticationService, private http: HttpClient) {
    this.createStompClient();
  }
  
  setupAuthenticationEvents() {
    this.auth.userLoginSuccess$.subscribe({next: user => this.createStompClient()});
    this.auth.userLoginFail$.subscribe({next: nothing => this.stompClient = null});
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
    
    this.stompClient.activate();
  }

  onConnect(frame: IFrame){
    console.log('Connected: ' + frame);
    this.setConnected(true);
    this.stompClient.subscribe('/user/api/topic/message', this.processNewMessage);
  }

  onStompError(frame: IFrame){
      // Will be invoked in case of error encountered at Broker
      // Bad login/passcode typically will cause an error
      // Complaint brokers will set `message` header with a brief message. Body may contain details.
      // Compliant brokers will terminate the connection after any error
      console.log('Broker reported error: ' + frame.headers['message']);
      console.log('Additional details: ' + frame.body);
  }

  processNewMessage(data: any) {
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
          .set("earlierThan", (new Date()).toISOString())
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
