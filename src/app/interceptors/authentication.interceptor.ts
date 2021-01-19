import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication.service';

/** Add token parameter */
@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

    constructor(private auth: AuthenticationService){}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      if(!this.auth.isAuthenticated())
        return next.handle(req);
      const authReq = req.clone({
          headers: req.headers.set("Authorization", "Bearer " + this.auth.tokens.idToken)
      })
      return next.handle(authReq);
  }

}