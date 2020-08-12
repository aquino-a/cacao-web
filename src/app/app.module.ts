import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FriendListComponent } from './friend-list/friend-list.component';
import { LoginComponent } from './login/login.component';
import { ChatComponent, MessageComponent } from './chat/chat.component';
import { AuthGuard } from './auth.guard';
import { AuthenticationService } from './authentication.service';

@NgModule({
  declarations: [
    AppComponent,
    FriendListComponent,
    LoginComponent,
    ChatComponent,
    MessageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    AuthGuard,
    AuthenticationService,
    {
      provide: APP_INITIALIZER,
      useFactory: (as: AuthenticationService) => {
        return () => {
           return as.load(); 
        }
      },
      deps:[AuthenticationService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
