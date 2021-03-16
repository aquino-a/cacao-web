import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, OnInit, Pipe } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from './user';

/**
 * Responsible for tasks related to Friends.
 * Adds friends.
 * Retrieves friend list.
 * Caches friend list.
 *
 * @export
 * @class FriendService
 */
@Injectable({
  providedIn: 'root'
})
export class FriendService {
  
  friends: Friend[] = [];
  friendSet: Map<string, User> = new Map<string, User>();
  
  constructor(private http: HttpClient) {
  }
  
  fetchFriendList(): Friend[] {
    const ob = this.http.get<User[]>(environment.baseUrl + "/api/friends")
        .pipe(map(users => 
          users.filter(u => !this.friendSet.has(u.id))
            .map(u => {
              this.friendSet.set(u.id, u);
              return { user: u, unreadMessages: 0 };
            }
        )));
    ob.subscribe({next: fs => this.friends.push(...fs)});
    return this.friends;
  }

  addFriend(email: string): Observable<Object>{
    const options = { params: new HttpParams().set("email", email) };
    const ob = this.http.post(environment.baseUrl + "/api/friend/add", null, options);
    ob.subscribe(data => console.log(data), error => console.log(error));
    return ob;
  }

  getFriendPhoto(id: string): string {
    if(!this.friendSet.has(id)){
      return "PHOTO";
    }
    else return this.friendSet.get(id).imgUrl;
  }
  
}

export interface Friend {
  user: User;
  unreadMessages: number;
}