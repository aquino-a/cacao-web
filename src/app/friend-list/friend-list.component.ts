import { Component, OnInit } from '@angular/core';
import { FriendService, Friend } from '../friend.service';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.css']
})
export class FriendListComponent implements OnInit {

  addEmail: string = '';

  constructor(public friendService: FriendService) {
  }
  
  friendList: Friend[];
  
  ngOnInit(): void {
    this.getFriendList();
  }

  getFriendList(){
    this.friendService.fetchFriendList()
      .subscribe(fs => { console.log(fs); this.friendList = fs; }, error => console.log(error));
  }

}
