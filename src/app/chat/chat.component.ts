import { Component, OnInit, Input, ElementRef, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService, Message } from '../message.service';
import { AuthenticationService } from '../authentication.service';
import { isDefined } from '@angular/compiler/src/util';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
 
  @ViewChildren('messages') private messageContainer: QueryList<ElementRef>;
  @ViewChild('messageContainer') private messageContainerChild: ElementRef;
  
  chatId: string;
  messages: Message[];
  currentUserId: string;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private auth: AuthenticationService
    ) { 
      auth.userLoginSuccess$.subscribe({next: user => this.currentUserId = user.id});
      auth.userLoginFail$.subscribe({next: nothing => this.currentUserId = null});
      messageService.newMessage$.subscribe({next: this.newMessage });
    }

  ngOnInit(): void {
    this.route.params.subscribe(p =>{
      this.chatId = this.route.snapshot.paramMap.get('id');
      this.messageService
        .fetchMessages(this.chatId)
        .subscribe(messages =>{
          this.messages = messages;
        });
    });
  }

  ngAfterViewInit() {
    this.messageContainer.changes.subscribe(this.scrollToBottom);
  }

  newMessage = (message: Message) => {
    if(!isDefined(this.messages) || !isDefined(message)){ 
      return;  
    }

    if(message.fromUser != this.chatId && message.toUser != this.chatId){
      return;
    }

    this.messages.push(message);
    if(message.toUser == this.auth.currentUser.id){
      this.read(message);
    }

  }

  send(newMessage: string){
    this.messageService.send(this.chatId, newMessage);
  }

  read(message: Message){
    this.messageService.readMessage(message);
  }

  scrollToBottom = () => {
    try {
      this.messageContainerChild.nativeElement.scrollTop = this.messageContainerChild.nativeElement.scrollHeight;
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
