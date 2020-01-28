import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostListComponent } from './posts/post-list/post-list.component';
import { LoginComponent } from './auth/login/login.component';
import { UserRegisterComponent } from './auth/user-registration/user-register.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { AdminPageComponent } from './auth/admin-page/admin-page.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {path: "postlist", component: PostListComponent},
  {path: "login", component: LoginComponent},
  {path: "register", component: UserRegisterComponent},
  {path: "create", component: PostCreateComponent, canActivate: [AuthGuard]},
  {path: "edit/:userId", component: UserRegisterComponent},
  {path: "adminpage", component: AdminPageComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
