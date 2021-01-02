import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  
  friendList: Friend[];
  
  constructor(private http: HttpClient) {
    console.log('in friendservice init');
   }
  
  fetchFriendList(): Friend[] {
    console.log(this.friendList);
    return this.friendList;
  }

  addFriend(email: string){
    this.http.post(environment.baseUrl + "/friends/add", {"email": email})
      .subscribe(data => console.log(data));
  }
  
}

export interface Friend {
  user: User;
  unreadMessages: number;
}