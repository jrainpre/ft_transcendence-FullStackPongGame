import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatComponent } from '../chat/chat.component';



@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})

export class EditComponent {

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router, private snackBar: MatSnackBar, private readonly chat: ChatComponent) {}
  id: string = '';
  profileUrl: string = '';
  curTFA: boolean = true;
  first_login: boolean = false;
  username: string = '';
  inputTFA: string = '';
  inputUsername: string = '';
  isUsersProfile: boolean = false;
  errorMessage: string = '';

  async ngOnInit(): Promise<any>{
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });
    let user;
    try{
      user = await this.api.getProfileInfo(this.id);
    }
    catch(error)
    {
    }
    this.username = user.name;
    this.inputUsername = this.username;
    if(user.tfa_enabled == true){
      this.curTFA = true;
    }
    else{
     this.curTFA = false;
   }
    this.profileUrl = user.profile_picture;
    if(user.first_login == true || user.first_login == undefined)
    {
      this.first_login = true;
      await this.api.setFirstLoginFalse();
    }
  }

  async changeUsername():Promise<any>{
    const UsernameId ={
      id_42: this.id,
      TFA: this.inputTFA,
      name: this.inputUsername
    }
    ;(await this.api.postEditUsername(UsernameId, this.id)).subscribe(
      (response: any) =>{
        this.router.navigate([`/profile/${this.id}`]);
      },
      (error) =>{
          this.errorMessage = error;
      }
    )
  }

  async changeTFA() : Promise<any>{
    if(this.curTFA == true && this.inputTFA == 'Enable'){
      this.errorMessage = 'Two Factor Authentication is already Enabled';
    }
    else if(this.curTFA == false && this.inputTFA == 'Disable'){
      this.errorMessage = 'Two Factor Authentication is already Disabled';
    }
    else if(this.curTFA == false && this.inputTFA == 'Enable'){
      this.router.navigate([`/enable-tfa/${this.id}`]);
    }
    else if(this.curTFA == true && this.inputTFA == 'Disable'){
      await this.api.postDisableTFA(this.id);
      this.router.navigate([`/profile/${this.id}`]);
    }
    else{
      this.errorMessage = "Nothing Selected"
    }
  }

  async onFileSelected(event: any): Promise<any> {
    const file: File = event.target.files[0]; // Get the selected file
    if(!file.type.startsWith('image/'))
     this.snackBar.open("Invalid Image format", "close", {duration: 3000,})
    else
     await this.api.postUploadFile(file, this.id);
  }
}
