import { Component, OnInit, Input, ElementRef, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService, Message } from '../message.service';
import { AuthenticationService } from '../authentication.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { FriendService } from '../friend.service';


/**
 * Handles all chat functions.
 * Displays messages.
 * Accepts new message input.
 * 
 * @export
 * @class ChatComponent
 * @implements {OnInit}
 */
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
    private auth: AuthenticationService,
    private friendService: FriendService
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
          this.messageContainer.changes
            .pipe(take(1))
            .subscribe({
              next: (args) => this.virtualViewport.scrollTo({bottom: 0}),
            });
          ;
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
    if(this.messages === undefined || message === undefined){ 
      return;  
    }

    if(!this.isThisChat(message)){
      return;
    }

    if(this.messageService.isDuplicateMessage(this.chatId, message.id)){
      return;
    }

    this.virtualViewport.scrollTo({bottom: -56});
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
    if(index <= 0){
      return true;
    }
    var before = this.messages[index - 1];
    return before.time.getDate() != this.messages[index].time.getDate();
  }

  isNewTime(index: number): boolean {
    if(this.messages.length == index + 1){
      return true;
    }

    if(index <= 0){
      return true;
    }

    var current = this.messages[index];
    var next = this.messages[index + 1];

    if(current.time.getHours() != next.time.getHours()){
      return true;
    }
    else return current.time.getMinutes() != next.time.getMinutes();
  }

  /**
   * Returns null if doesn't need photo based on time and if it's the from user
   *
   * @param {number} index
   * @param {string} id
   * @return {*}  {string}
   * @memberof ChatComponent
   */
  getFriendPhoto(index: number, id: string): string {
    if(id === this.auth.currentUser.id) {
      return null;
    }

    if(!this.isNewTime(index - 1)){
      return null;
    }
    
    return this.friendService.getFriendPhoto(id);
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
    const bottomOffset = this.virtualViewport.measureScrollOffset("bottom");
    this.isRefreshing = true;
    this.messages = ms;

    const p = new Promise((resolve, reject) =>{
      setTimeout(() => {
        this.virtualViewport.scrollTo({bottom: bottomOffset});
        this.isRefreshing = false;
        resolve(null);
        this.onScrollSubscribe();
      }, 150);
    });
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
  @Input() fromUserImgSrc: string;
}

/**
 * Encapsulates running an observable only once at the same time.
 *
 * @class PacedObservable
 * @template T
 */
class PacedObservable<T> {

  private readonly obFactory: () => Observable<T>;
  private readonly subNext: (t: T) => void;
  private isRunning: boolean;
/**
 * Creates an instance of PacedObservable.
 * @param {() => Observable<T>} obFactory
 * @param {(t: T) => void} subNext
 * @memberof PacedObservable
 */
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
