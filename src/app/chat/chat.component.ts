import { Component, OnInit, Input, ElementRef, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService, Message } from '../message.service';
import { AuthenticationService } from '../authentication.service';
import { isDefined } from '@angular/compiler/src/util';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  
  @ViewChildren('messages') private messageContainer: QueryList<ElementRef>;
  @ViewChild(CdkVirtualScrollViewport) virtualMessages: CdkVirtualScrollViewport;
  
  chatId: string;
  messages: Message[];
  currentUserId: string;
  private isNotificationsOk: boolean;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private auth: AuthenticationService
    ) { 
      auth.userLoginSuccess$.subscribe({next: user => this.currentUserId = user.id});
      auth.userLoginFail$.subscribe({next: nothing => this.currentUserId = null});
    }

  ngOnInit(): void {
    this.route.params.subscribe(p =>{
      this.chatId = this.route.snapshot.paramMap.get('id');
      this.messageService
        .fetchMessages(this.chatId)
        .subscribe(messages =>{
          this.messages = messages;
          this.messages.filter(m => !m.wasRead).forEach(m => this.read(m));
        });
    });
    this.messageService.newMessage$.subscribe({next: this.newMessage });
  }

  ngAfterViewInit() {
    this.messageContainer.changes.subscribe(this.scrollToBottom);
    this.askNotificationPermission();
    this.virtualMessages.scrolledIndexChange.subscribe({next: this.onScrolled});
  }

  askNotificationPermission() {
    if(!Notification) {
      return;
    } 

    if(Notification.permission != 'granted'){
      Notification.requestPermission().then(p => console.log(p));
    }
  }

  newMessage = (message: Message) => {
    if(!isDefined(this.messages) || !isDefined(message)){ 
      return;  
    }

    if(!this.isThisChat(message)){
      return;
    }

    if(this.messageService.isDuplicateMessage(this.chatId, message.id)){
      return;
    }

    this.messages = [...this.messages, message];
    this.scrollToBottom();
    if(message.toUser == this.auth.currentUser.id){
      this.read(message);
    }

  }

  isThisChat(message: Message): boolean {
    if(message.fromUser != this.chatId && message.toUser != this.chatId){
      return false;
    }

    if(this.chatId === this.auth.currentUser.id){
      return message.fromUser === this.auth.currentUser.id && message.toUser === this.auth.currentUser.id;
    }

    return true;
  }

  send(newMessage: string){
    this.messageService.send(this.chatId, newMessage);
  }

  read(message: Message){
    this.messageService.readMessage(message);
  }

  scrollToBottom = () => {
    try {
      this.virtualMessages.scrollToIndex(this.messages.length - 1);
    } catch(error) {
      console.log(error);
    }  
  }

  isNewDate(index: number) : boolean {
    if(index == 0){
      return true;
    }
    var before = this.messages[index - 1];
    return before.time.getDate() != this.messages[index].time.getDate();
  }

  isNewTime(index: number): boolean {
    if(this.messages.length == index + 1){
      return true;
    }

    var current = this.messages[index];
    var next = this.messages[index + 1];

    if(current.time.getHours() != next.time.getHours()){
      return true;
    }
    else return current.time.getMinutes() != next.time.getMinutes();
  }

  onScrolled = (newIndex: number): void => {
    if(newIndex > 0){
      return;
    }
    
    this.messageService.fetchOldMessages(this.chatId)
      .subscribe({next: ms => {
        if(ms == null){
          return;
        }
        this.messages = ms;
      }, error: e =>{
        console.log(e);
      }});
  }

}

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./chat.component.css']
})
export class MessageComponent {
  @Input() message: Message;
  @Input() isUser: boolean;
  @Input() isNewDate: boolean = true;
  @Input() isNewTime: boolean = true;
}
