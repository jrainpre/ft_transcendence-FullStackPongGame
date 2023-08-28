import { Component } from '@angular/core';
import { AuthService } from '../api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private authApi: AuthService) {}

  login42(){
    window.location.href = 'https://api.intra.42.fr/oauth/authorize' +
    '?client_id=u-s4t2ud-9904fa10768d1a760e5ff38e9647bde2c6b9431a9c32b5269fe17946f41a414a' +
    '&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fapi%2Fauth%2F42%2Fredirect' +
    '&response_type=code';
  }
}
