import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService, Message } from '../message.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  chatId: string;
  messages: Message[];

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService
    ) { }

  ngOnInit(): void {
    this.chatId = this.route.snapshot.paramMap.get('id');
    this.messageService
      .fetchMessages(this.chatId)
      .subscribe(messages =>{
        this.messages = messages;
      });
  }

}
