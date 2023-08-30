import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {}
  id: string = '';
  profileUrl:string = '';
  username: string = '';
  tfa_enabled: string = '';
  wins: string = '';
  losses: string = '';
  win_loss_ratio: string = '';

  async ngOnInit(): Promise<any>{
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
    })
   const user = await this.api.getProfileInfo(this.id);
   this.setProfileVars(user);
  }

  setProfileVars(user: any){
   this.profileUrl = user.profile_picture;
   this.username = user.name;
   if(user.tfa_enabled == true)
    this.tfa_enabled = 'true';
   else
    this.tfa_enabled = 'false';
   this.wins = user.win_ranked.toString();
   this.losses = user.loss_ranked.toString();
   this.win_loss_ratio = (user.win_ranked / user.loss_ranked).toString();
  }

  setParamId(){
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
    })
  }

  routGamePage(){
    this.router.navigate([`/game/`]);
  }

  routEditPage(){
    this.router.navigate([`/edit/`, this.id]);
  }
}
