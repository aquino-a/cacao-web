import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FriendListComponent } from './friend-list/friend-list.component';
import { LoginComponent } from './login/login.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'friends', component: FriendListComponent },
  { path: '', component: FriendListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
