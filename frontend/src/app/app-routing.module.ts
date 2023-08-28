import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {path: '2fa', component: TwoFactorAuthComponent},
  {path: 'login', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
