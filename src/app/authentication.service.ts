import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from './user';
import { BehaviorSubject, Subject } from 'rxjs';
import { isNull, ThrowStmt } from '@angular/compiler/src/output/output_ast';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  
  baseUrl = environment.baseUrl;
  tokens: Tokens;
  currentUser: User;

  private userLoginSuccessSource = new BehaviorSubject<User>(null);
  private userLoginFailSource = new Subject<any>();
  
  userLoginSuccess$ = this.userLoginSuccessSource.asObservable();
  userLoginFail$ = this.userLoginFailSource.asObservable();


  constructor(private http: HttpClient, private router: Router) {
     
  }

  load(): Promise<any> {
    return new Promise((resolve) =>{
      if(localStorage.tokens != null){
        var localTokens = JSON.parse(localStorage.tokens) as Tokens;
        if(this.notExpired(localTokens.idToken)){
          this.tokens = localTokens;
          this.setUser(this.tokens.idToken);
        }
      }
      resolve();
    }).catch(error => console.log(error));
  }

  notExpired(jwtToken: string): boolean {
    var payload = this.getPayload<GoogleData>(jwtToken);
    var expDate = new Date(Number.parseInt(payload.exp) * 1000);
    return Date.now() < expDate.getTime();
  }
  
  authenticate(code: string) {
    this.http.get<Tokens>(this.baseUrl + '/token/google', 
      { params: new HttpParams()
        .set('authCode', code)
      }).subscribe(tokens => {
        this.tokens = tokens;
        this.setUser(this.tokens.idToken);
        localStorage.tokens = JSON.stringify(this.tokens);
        console.log(tokens);
        this.router.navigate(['']);
      }, error =>{
        this.logout();
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

  logout(){
    this.currentUser = null;
    localStorage.tokens = null;
    this.userLoginFailSource.next();
    this.router.navigate(['login']);
  }

}

interface GoogleData {
  email: string;
  name: string;
  picture: string;
  sub: string;
  exp: string;
}

export interface Tokens {
  accessToken: string,
  idToken: string
}
