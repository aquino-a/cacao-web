import { Component, OnInit, Input, ElementRef, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService, Message } from '../message.service';
import { AuthenticationService } from '../authentication.service';
import { isDefined, stringify } from '@angular/compiler/src/util';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { isNull } from '@angular/compiler/src/output/output_ast';
import { ITS_JUST_ANGULAR } from '@angular/core/src/r3_symbols';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ListRange } from '@angular/cdk/collections';

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
  private subscription: Subscription = new Subscription();
  private scrollUpSub: Subscription;


  private oldMessageObserve: PacedObservable<Message[]>;
  private isScrolling: boolean;  

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private auth: AuthenticationService
    ) { 
      auth.userLoginSuccess$.subscribe({next: user => this.currentUserId = user.id});
      auth.userLoginFail$.subscribe({next: nothing => this.currentUserId = null});
      messageService.newMessage$.subscribe({next: this.newMessage });
      this.oldMessageObserve = new PacedObservable(() => this.messageService.fetchOldMessages(this.chatId), this.processOldMessages);
    }

  ngOnInit(): void {
    this.route.params.subscribe(p =>{
      this.chatId = this.route.snapshot.paramMap.get('id');
      this.messageService
        .fetchMessages(this.chatId)
        .subscribe(messages =>{
          this.messages = messages;
          this.messages.filter(m => !m.wasRead).forEach(m => this.read(m));
          this.scrollToOnce(this.messages.length - 1);
          this.onScrollSubscribe();
        });
    });
  }

  ngAfterViewInit() {
    this.askNotificationPermission();
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
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

    this.scrollToOnce(this.messages.length - 1);
    this.messages = [...this.messages, message];
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
    if(newMessage.length === 0){
      return;
    }
    this.messageService.send(this.chatId, newMessage);
  }

  read(message: Message){
    this.messageService.readMessage(message);
  }

  scrollToOnce(index: number) {
    this.messageContainer.changes
      .pipe(take(1))
      .subscribe({
        next: (args) => { this.isScrolling = true; console.log("is scrolling: " + this.isScrolling); this.virtualMessages.scrollToIndex(index); },
        complete: () => { this.isScrolling = false; console.log("is scrolling: " + this.isScrolling);}
      });
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
    console.log("changed index: " + newIndex);
    if(newIndex > 5 || this.isScrolling){
      return;
    }
    this.scrollUpSub.unsubscribe();
    this.oldMessageObserve.run();
  }

 onRangeChange = (range: ListRange): void => {
    console.log("changed range: " + range.start + " " + range.end);
    if(range.start > 3 || this.isScrolling){
      return;
    }
    this.scrollUpSub.unsubscribe();
    this.oldMessageObserve.run();
  }

  processOldMessages = (ms: Message[]): void => {
    try{
      if(ms == null || ms.length == 0) {
        return;
      }
      const scrollIndex = this.calculateMessageIndex(this.messages, ms);
      this.scrollToOnce(scrollIndex);
      console.log(new Date().getMilliseconds());
      this.messages = ms;
      console.log("scroll to: " + scrollIndex);
    }
    finally{
      this.onScrollSubscribe();
    }
  }

  calculateMessageIndex(oldArray: Message[], newArray: Message[]): number {
    return newArray.length - oldArray.length + 10;
  }
  

  onScrollSubscribe(): void {
    console.log("scroll up subbed");
    this.scrollUpSub = this.virtualMessages.renderedRangeStream
      .subscribe({next: this.onRangeChange})
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

class PacedObservable<T> {

  private readonly obFactory: () => Observable<T>;
  private readonly subNext: (t: T) => void;
  private isRunning: boolean;

  constructor(obFactory: () => Observable<T>, subNext: (t: T) => void) {
    this.obFactory = obFactory;
    this.subNext = subNext;
  }

  run(): void {
    if(this.isRunning){
      return;
    }
    this.isRunning = true;

    this.obFactory().subscribe({
      next:this.subNext,
      complete: () => this.isRunning = false,
      error: (e) => { console.log(e); this.isRunning = false; }
    })
  }

}
