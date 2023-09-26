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
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PersonalMatchHistoryComponent } from './personal-match-history/personal-match-history.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HeartbeatComponent } from './heartbeat/heartbeat.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule, } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatRadioModule} from '@angular/material/radio';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatMenuModule} from '@angular/material/menu';
 






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
    ChatComponent,
    SidebarComponent,
    LeaderboardComponent,
    FriendlistComponent,
    MatchHistoryComponent,
    PageNotFoundComponent,
    PersonalMatchHistoryComponent,
    HeartbeatComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LoginModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    NgbDropdownModule,
    MatSelectModule,
    MatListModule,
    MatExpansionModule,
    MatCardModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatGridListModule,
    MatChipsModule,
    MatTooltipModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatInputModule,
    MatCheckboxModule,
    MatMenuModule,

  ],
  exports: [MatExpansionModule,
    MatCardModule,
    MatChipsModule],
  providers: [ProfileComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
