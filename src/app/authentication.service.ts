import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from './user';
import { BehaviorSubject, Subject } from 'rxjs';
import { isNull } from '@angular/compiler/src/output/output_ast';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  
  baseUrl = environment.baseUrl;
  tokens: Tokens;
  currentUser: User;

  private userLoginSuccessSource = new Subject<User>();
  private userLoginFailSource = new Subject<any>();
  
  userLoginSuccess$ = this.userLoginSuccessSource.asObservable();
  userLoginFail$ = this.userLoginFailSource.asObservable();


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
        this.currentUser = null;
        this.userLoginFailSource.next();
        console.log(error);
      });
  }

  private setUser(idToken: string) {
    this.currentUser = this.jwtToUser(idToken);
    this.userLoginSuccessSource.next(this.currentUser);
  }

  jwtToUser(idToken: string): User {
    var userData = this.getPayload<GoogleData>(idToken);
    return { email: userData.email, id: userData.sub, imgUrl: userData.picture, realName: userData.name };
  }

  getPayload<T>(jwt: string): T {

    var jwtPieces = jwt.split('.', 2);
    if(jwtPieces.length != 2){
      throw new Error("Must be string with one or more periods");
    }
    return JSON.parse(atob(jwtPieces[1])) as T;
  }

  isAuthenticated() {
    return this.currentUser != null;
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
