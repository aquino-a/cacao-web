import { Component } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { User } from './user';
import * as $ from "jquery";
import "bootstrap";
import { MessageService } from './message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cacao-web';
  currentUser: User;


  constructor(public auth: AuthenticationService, private messageService: MessageService){
    auth.userLoginSuccess$.subscribe({
      next: user => {
        this.currentUser = user;
      }
    });
    auth.userLoginFail$.subscribe({
      next: nothing => {
        this.currentUser = null;
      }
    });
    messageService.disconnected$.subscribe({next: (e) => {
      if(e != null){
        $('#disconnectedModal').modal("show");
      }
    }});
    messageService.connected$.subscribe({next: (e) => {
      if(e != null){
        $('#disconnectedModal').modal("hide");
      }
    }});
  }
}
