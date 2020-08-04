import { Component } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { User } from './user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cacao-web';
  currentUser: User;


  constructor(private authenticationService: AuthenticationService){
    authenticationService.userLoginSuccess$.subscribe({
      next: user => {
        this.currentUser = user;
      }
    });
    authenticationService.userLoginFail$.subscribe({
      next: nothing => {
        this.currentUser = null;
      }
    });
  }
}
