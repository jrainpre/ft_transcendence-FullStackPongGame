import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})

export class EditComponent {

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router,) {}
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

  changeUsername(){
    const changedInfo ={
      id_42: this.id,
      TFA: this.inputTFA,
      name: this.inputUsername
    }
    this.api.postEditUsername(changedInfo);
    console.log(changedInfo)
  }

  changeTFA(){
    if(this.curTFA == true && this.inputTFA == 'Enable'){
      this.errorMessage = 'Two Factor Authentication is already Enabled';
    }
    else if(this.curTFA == false && this.inputTFA == 'Disable'){
      this.errorMessage = 'Two Factor Authentication is already Disabled';
    }
    else if(this.curTFA == false && this.inputTFA == 'Enabled'){
      //redirect to activate TFA
    }
    else if(this.curTFA == true && this.inputTFA == 'Disable'){
      //disable TFA
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
