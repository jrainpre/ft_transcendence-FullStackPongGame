import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { LoginModule } from './login/login.module';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { TwoFactorAuthComponent } from './two-factor-auth/two-factor-auth.component';
import { FormsModule } from '@angular/forms';
import { GameComponent } from './game/game.component';
import { ProfileComponent } from './profile/profile.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditComponent } from './edit/edit.component';
import { EnableTFAComponent } from './enable-tfa/enable-tfa.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ChatComponent } from './chat/chat.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { FriendlistComponent } from './friendlist/friendlist.component';
import { MatchHistoryComponent } from './match-history/match-history.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    TwoFactorAuthComponent,
    GameComponent,
    ProfileComponent,
    EditComponent,
    EnableTFAComponent,
    SidebarComponent,
    ChatComponent,
    LeaderboardComponent,
    FriendlistComponent,
    MatchHistoryComponent,
    PageNotFoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LoginModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    BrowserAnimationsModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
