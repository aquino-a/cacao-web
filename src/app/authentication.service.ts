import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from './user';

declare function require(name:string);
var jose = require('jose');

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  
  baseUrl = environment.baseUrl;
  tokens: Tokens;
  currentUser: User = { email: "john@gmail.com", id: "1234", imgUrl: "https://lh3.googleusercontent.com/ogw/ADGmqu-JMRosn04hKyKrbDQBwqHnpZZw9ZBq6tf19tA=s32-c-mo", realName: "Johnnie" };

  userLoginSuccess = new EventEmitter<User>(true);
  userLoginFail = new EventEmitter<any>(true);
  
  


  constructor(private http: HttpClient) { 

  }
  
  authenticate(code: string) {
    this.http.get<Tokens>(this.baseUrl + '/token/google', 
      { params: new HttpParams()
        .set('authCode', code)
      }).subscribe(tokens => {
        this.tokens = tokens;
        this.setUser(this.tokens.idToken);
        console.log(tokens);
      }, error =>{
        console.log(error);
      });
  }

  private setUser(idToken: string) {
    var decodedJwt = jose.decode(idToken);
    var userData = decodedJwt.payload as GoogleData;
    this.currentUser = { email: userData.email, id: userData.sub, imgUrl: userData.picture, realName: userData.name };
    this.userLoginSuccess.emit(this.currentUser);
  }

}


// "iss": "https://accounts.google.com",
//   "azp": "407408718192.apps.googleusercontent.com",
//   "aud": "407408718192.apps.googleusercontent.com",
//   "sub": "114802719992795296332",
//   "email": "blackterrapin@gmail.com",
//   "email_verified": true,
//   "at_hash": "tYN0svt3cAO3ySC3XxaOKQ",
//   "name": "Alex Aquino",
//   "picture": "https://lh3.googleusercontent.com/a-/AOh14Gi36ziLTB7gCY2ejEUQpqN4a5-Jb1Wt0H-KgTE=s96-c",
//   "given_name": "Alex",
//   "family_name": "Aquino",
//   "locale": "en",
//   "iat": 1596205013,
//   "exp": 1596208613
interface GoogleData {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export interface Tokens {
  accessToken: string,
  idToken: string
}
