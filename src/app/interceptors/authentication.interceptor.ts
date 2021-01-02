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
        const authReq = req.clone({
            params: req.params.set("token", this.auth.tokens.accessToken)
        })
      return next.handle(authReq);
  }

}