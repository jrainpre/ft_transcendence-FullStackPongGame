import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component';
import { LoginComponent } from './login/login.component';
import { GameComponent } from './game/game.component';
import { ProfileComponent } from './profile/profile.component';
import { EditComponent } from './edit/edit.component';
import { EnableTFAComponent } from './enable-tfa/enable-tfa.component';
import { ChatComponent } from './chat/chat.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoadingComponent } from './game/loading/loading.component';
import { MatchComponent } from './game/match/match.component';

const routes: Routes = [
  {path: '2fa', component: TwoFactorAuthComponent},
  {path: 'login', component: LoginComponent},
  {path: 'game', component: GameComponent},
  {path: 'profile/:id', component: ProfileComponent},
  {path: 'edit/:id', component: EditComponent},
  {path: 'enable-tfa/:id', component: EnableTFAComponent},
  {path: 'chat', component: ChatComponent},
  {path: 'leaderboard', component: LeaderboardComponent},
  {path: 'loading/:parameter', component: LoadingComponent},
  {path: 'match', component: MatchComponent},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
