import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(private router: Router, private api: ApiService) {}


  async routProfile(): Promise<any>{
    const id = await this.api.getIdByJwt();
    this.router.navigate([`/profile/${id}`]);
  }
}
