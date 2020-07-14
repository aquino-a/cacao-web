import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  
  baseUrl = environment.baseUrl;
  tokens: Tokens;

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
