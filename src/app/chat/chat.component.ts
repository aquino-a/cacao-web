import { Component, OnInit, Input, ElementRef, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService, Message } from '../message.service';
import { AuthenticationService } from '../authentication.service';
import { isDefined, stringify } from '@angular/compiler/src/util';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
 
  
  @ViewChildren('messages') private messageContainer: QueryList<Message>;
  @ViewChild(CdkVirtualScrollViewport) virtualViewport: CdkVirtualScrollViewport;
  
  chatId: string;
  messages: Message[];
  currentUserId: string;
  
  private subscription: Subscription = new Subscription();
  private scrollUpSub: Subscription;


  private oldMessageObserve: PacedObservable<Message[]>;
  private isRefreshing: boolean;  
  private lastScrollIndex: number = Number.MIN_SAFE_INTEGER;

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
    console.log("ordered to scroll to: " + index);
    this.messageContainer.changes
      .pipe(take(1))
      .subscribe({
        next: (args) => { this.isRefreshing = true; console.log("actually scrolls to: " + index);  this.virtualViewport.scrollToIndex(index); },
        complete: () => { this.isRefreshing = false; }
      });
  }

  scrollToBottom = () => {
    try {
      this.virtualViewport.scrollToIndex(this.messages.length - 1);
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
    if(!this.needsRefresh(this.lastScrollIndex, newIndex) || this.isRefreshing){
      this.lastScrollIndex = newIndex;
      return;
    }
    this.scrollUpSub.unsubscribe();
    this.oldMessageObserve.run();
    this.lastScrollIndex = Number.MIN_SAFE_INTEGER;
  }

  needsRefresh(lastIndex: number, newIndex: number): boolean {
    if(newIndex >= lastIndex){
      return false;
    }

    if(lastIndex - newIndex > 4){
      return false;
    }

    if(newIndex > 10){
      return false;
    }

    return true;
    
  }

  processOldMessages = (ms: Message[]): void => {
    if(ms == null || ms.length == 0) {
      return;
    }
    
    const offset = this.calculateScrollOffset();
    this.isRefreshing = true;
    this.messages = ms;

    const p = new Promise((resolve, reject) =>{
      setTimeout(() => {
        this.printMeasures();
        const newHeight = this.parsePixels(this.virtualViewport._totalContentHeight);
        const scrollTo = newHeight - offset;
        
        console.log("scroll to: " + scrollTo);
        this.virtualViewport.scrollToOffset(scrollTo);
        this.isRefreshing = false;
        resolve(null);
        this.onScrollSubscribe();
      }, 100);
    });
  }

  calculateMessageIndex(oldArray: Message[], newArray: Message[]): number {
    const range = this.virtualViewport.getRenderedRange();
    const diff = newArray.length - oldArray.length;

    return diff + Math.floor((range.end - range.start)*.5);
  }

  calculateScrollOffset(){
    this.printMeasures();
    const topOffset = this.virtualViewport.measureScrollOffset("top");
    const height = this.parsePixels(this.virtualViewport._totalContentHeight);

    return height - topOffset;
  }

  parsePixels(length: string){
    return Number.parseInt(length.substring(0, length.length - 2))
  }

  printMeasures() {
    console.log("--");
    console.log("------------");
    console.log("viewport size: " + this.virtualViewport.getViewportSize());
    console.log("content start: " + this.virtualViewport.getOffsetToRenderedContentStart());
    console.log("total height: " + this.virtualViewport._totalContentHeight);

    console.log("start: " + this.virtualViewport.measureScrollOffset("start"));
    console.log("end: " + this.virtualViewport.measureScrollOffset("end"));
    console.log("top: " + this.virtualViewport.measureScrollOffset("top"));
    console.log("bottom: " + this.virtualViewport.measureScrollOffset("bottom"));
    console.log("------------");
    console.log("--");

  }
  

  onScrollSubscribe(): void {
    this.scrollUpSub = this.virtualViewport.scrolledIndexChange
      .subscribe({next: this.onScrolled})
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
