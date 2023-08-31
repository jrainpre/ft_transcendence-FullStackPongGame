import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})

export class EditComponent {

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {}
  id: string = '';
  profileUrl: string = '';

  curTFA: boolean = true;

  inputTFA: string = '';
  inputUsername: string = '';

  errorMessage: string = '';

  async ngOnInit(): Promise<any>{
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });
    //await this.setParamId();
    const user = await this.api.getProfileInfo(this.id);
    if(user.tfa_enabled == true){
      this.curTFA = true;
    }
   else{
     this.curTFA = false;
   }
    this.profileUrl = user.profile_picture;
  }
  async setParamId(): Promise<any>{
  }

  async changeUsername():Promise<any>{
    const changedInfo ={
      id_42: this.id,
      TFA: this.inputTFA,
      name: this.inputUsername
    }
    await this.api.postEditUsername(changedInfo);
    this.router.navigate([`/profile/${this.id}`]);
  }

  async changeTFA() : Promise<any>{
    console.log(this.inputTFA);
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

    }
  }

  onFileSelected(event: any) {
    console.log('Called');
    const file: File = event.target.files[0]; // Get the selected file
    console.log(file);
  }
}
