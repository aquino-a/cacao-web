import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { FriendService, Friend } from '../friend.service';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.css']
})
export class FriendListComponent implements OnInit {

  newEmail: string = '';

  constructor(private friendService: FriendService, private auth: AuthenticationService) {
    auth.userLoginSuccess$.subscribe(u => this.getFriendList());
  }
  
  friendList: Friend[];
  
  ngOnInit(): void {
  }

  getFriendList(){
    this.friendService.fetchFriendList()
      .subscribe(fs => { console.log(fs); this.friendList = fs; }, error => console.log(error));
  }

  addEmail(){
    this.friendService.addFriend(this.newEmail)
      .subscribe(o => this.getFriendList());
  }

}
