import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FriendListComponent } from './friend-list/friend-list.component';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { AuthGuard } from "./auth.guard";

const routes: Routes = [
  { 
    path: 'chat/:id', component: ChatComponent ,
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent },
  // { path: 'friends', component: FriendListComponent },
  // { path: '', component: FriendListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
