import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { isNullOrUndefined } from 'util';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  redirectUrl = environment.redirectUrl;
  clientId = environment.clientId;

  constructor(private activatedRoute: ActivatedRoute, private authenticationService: AuthenticationService ) {

    this.activatedRoute.queryParams.subscribe(params => {
          let code = params['code'];
          if(!isNullOrUndefined(code)){
            console.log(code); // Print the parameter to the console. 
            this.authenticationService.authenticate(code);
          }
      });

  }
  ngOnInit(): void {
  }

}
