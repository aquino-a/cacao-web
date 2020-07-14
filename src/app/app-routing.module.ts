import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FriendListComponent } from './friend-list/friend-list.component';


const routes: Routes = [
  { path: 'friends', component: FriendListComponent },
  { path: '', component: FriendListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
