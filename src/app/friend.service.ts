import { Injectable, OnInit } from '@angular/core';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  
  friendList: Friend[];
  
  constructor() {
    console.log('in friendservice init');
    this.friendList = [
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 2},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 4},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 0},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 22},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
      { user: { email: "john@gmail.com", id: "123", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" }, unreadMessages: 123},
    ];
   }
  
  fetchFriendList(): Friend[] {
    console.log(this.friendList);
    return this.friendList;
  }
  
}

export interface Friend {
  user: User;
  unreadMessages: number;
}