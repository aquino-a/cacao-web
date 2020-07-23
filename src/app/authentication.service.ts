import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  
  baseUrl = environment.baseUrl;
  tokens: Tokens;
  currentUser: User = { email: "john@gmail.com", id: "1234", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" };

  constructor(private http: HttpClient) { 

  }
  
  authenticate(code: string) {
    this.http.get<Tokens>(this.baseUrl + '/token/google', 
      { params: new HttpParams()
        .set('authCode', code)
      }).subscribe(tokens => {
        this.tokens = tokens;
        console.log(tokens);
      }, error =>{
        console.log(error);
      });
  }

}

export interface Tokens {
  accessToken: string,
  idToken: string
}
