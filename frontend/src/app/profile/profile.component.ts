import { Component, booleanAttribute } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router, private snackBar: MatSnackBar, private readonly chat: ChatComponent) {}
  id: string = '';
  profileUrl:string = '';
  username: string = '';
  tfa_enabled: string = '';
  wins: string = '';
  losses: string = '';
  win_loss_ratio: string = '';
  isUsersProfile: boolean = false;
  isFriend: boolean = false;
  isBlocked: boolean = false;
  public reloadPersonalMatchHistory$ = new Subject<void>();
  public reloadFriendList$ = new Subject<void>();

  async loadData() {
    this.chat.updateSocketId();
    let user;
    try{
      user = await this.api.getProfileInfo(this.id);
      this.isBlocked = await this.api.isBlocked(this.id);
    }
    catch(error){
      return;
    }
    this.isFriend = await this.api.isFriend(this.id);
    this.setProfileVars(user);
  
    this.isUsersProfile = await this.api.isUser(this.id);
  }
  
  async ngOnInit(): Promise<any>{
    this.route.params.subscribe(params => {
      const newId = params['id'];
      if(newId != this.id){
        this.id = newId;
        this.reloadPage();
      }

    this.loadData();

    });
  }

  reloadPage() {
    // Reload the page by navigating to the current URL
    this.router.navigateByUrl('/profile/' + this.id, { skipLocationChange: true }).then(() => {
      this.router.navigate(['/profile/' + this.id]);

      this.reloadPersonalMatchHistory();
    });
  }

  reloadPersonalMatchHistory() {
    this.reloadPersonalMatchHistory$.next();
  }

  reloadFriendList() {
    this.reloadFriendList$.next();
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
   this.win_loss_ratio = ((user.win_ranked / user.loss_ranked).toFixed(2)).toString();
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

  async addFriend(): Promise<any>{
    try{
      const added = await this.api.addFriend(this.id);
      this.ngOnInit();
      this.reloadFriendList();
    }
    catch(error){
      this.snackBar.open("Error adding friend", "close", {duration: 3000,});
    }
  }

  async removeFriend(): Promise<any>{
    try{
      const added = await this.api.removeFriend(this.id);
      this.ngOnInit();
      this.reloadFriendList();
    }
    catch(error){
      this.snackBar.open("Error", "close", {duration: 3000,});
    }
  }

  async blockUser(): Promise<any>{
    const userToBlockDTO = {
      id_42: parseInt(this.id, 10),
      name: this.username
  }
  try{
    await this.api.blockUser(userToBlockDTO);
    this.ngOnInit();
  }
  catch(error){
    this.snackBar.open("Error blocking User", "close", {duration: 3000,});
  }
}

async unblockUser(): Promise<any>{
  const userToBlockDTO = {
    id_42: parseInt(this.id, 10),
    name: this.username
}
try{
  await this.api.unblockUser(userToBlockDTO);
  this.ngOnInit();
}
catch(error){
  this.snackBar.open("Error unblocking User", "close", {duration: 3000,});
}
}
}
