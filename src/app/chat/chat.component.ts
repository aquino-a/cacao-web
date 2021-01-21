import { Component, OnInit, Input } from '@angular/core';
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

  chatId: string;
  messages: Set<Message>;
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
    this.chatId = this.route.snapshot.paramMap.get('id');
    this.messageService
      .fetchMessages(this.chatId)
      .subscribe(messages =>{
        this.messages = new Set<Message>(messages);
      });
  }

  newMessage = (message: Message) => {
    if(!isDefined(this.messages) || !isDefined(message)){ 
      return;  
    }

    if(message.fromUser != this.chatId && message.toUser != this.chatId){
      return;
    }

    this.messages.add(message); 
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
}

@Component({
  selector: 'app-message',
  template: `
    <label>{{message.id}}</label>
    <br/>
    <label>{{message.time.toUTCString()}}</label>
    <p>{{message.message}}</p>
`
})
export class MessageComponent {
  @Input() message: Message;
}
