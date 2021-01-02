import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, OnInit, Pipe } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  
  
  constructor(private http: HttpClient) {
    console.log('in friendservice init');
   }
  
  fetchFriendList(): Observable<Friend[]> {
    return this.http.get<User[]>(environment.baseUrl + "/api/friends")
        .pipe(map(users => users.map(u => {
          return { user: u, unreadMessages: 0 };
        })));
  }

  addFriend(email: string){
    const options = { params: new HttpParams().set("email", email) };
    this.http.post(environment.baseUrl + "/api/friend/add", null, options)
      .subscribe(data => console.log(data), error => console.log(error));
  }
  
}

export interface Friend {
  user: User;
  unreadMessages: number;
}