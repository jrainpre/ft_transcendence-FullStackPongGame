import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(private router: Router, private api: ApiService, private cookie: CookieService) {}


  async routProfile(): Promise<any>{
    const id = await this.api.getIdByJwt();
    this.router.navigate([`/profile/${id}`]);
  }

  routGame(): void{
    this.router.navigate(['/game']);
  }
  
  routChat(): void{
    this.router.navigate(['/chat']);
  }

  routLeaderboard(): void{
    this.router.navigate(['/leaderboard']);
  }

  async logOut(): Promise<any> {
    console.log("Logout");
    this.cookie.delete("jwtToken");
    this.router.navigate(['/login']);
    }
}
