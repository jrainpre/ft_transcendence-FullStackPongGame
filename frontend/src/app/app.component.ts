import { Component } from '@angular/core';
import { AuthService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private authApi: AuthService) {}
  title = 'test';

  loginClicked(){
    alert('Hallo');
  }


}
