import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService, Message } from '../message.service';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  chatId: string;
  messages: Message[];
  currentUserId: string;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
    ) { 
      this.currentUserId = authenticationService.currentUser.id;
    }

  ngOnInit(): void {
    this.chatId = this.route.snapshot.paramMap.get('id');
    this.messageService
      .fetchMessages(this.chatId)
      .subscribe(messages =>{
        this.messages = messages;
      });
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
