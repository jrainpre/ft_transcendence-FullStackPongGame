import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component';
import { LoginComponent } from './login/login.component';
import { GameComponent } from './game/game.component';
import { ProfileComponent } from './profile/profile.component';
import { EditComponent } from './edit/edit.component';
import { EnableTFAComponent } from './enable-tfa/enable-tfa.component';

const routes: Routes = [
  {path: '2fa', component: TwoFactorAuthComponent},
  {path: 'login', component: LoginComponent},
  {path: 'game', component: GameComponent},
  {path: 'profile/:id', component: ProfileComponent},
  {path: 'edit/:id', component: EditComponent},
  {path: 'enable-tfa/:id', component: EnableTFAComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
