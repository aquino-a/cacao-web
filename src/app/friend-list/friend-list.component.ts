import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { FriendService, Friend } from '../friend.service';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.css']
})
export class FriendListComponent implements OnInit {

  newEmail: string = '';

  constructor(private friendService: FriendService,
     private auth: AuthenticationService,
     public messageService: MessageService) {
    auth.userLoginSuccess$.subscribe(u => this.getFriendList());
  }
  
  friendList: Friend[];
  
  ngOnInit(): void {
  }

  getFriendList(){
    this.friendList = this.friendService.fetchFriendList();
  }

  addEmail(){
    this.friendService.addFriend(this.newEmail)
      .subscribe(o => this.getFriendList());
  }

}
