import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import {CookieService} from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  
  searchQuery: string = '';
  constructor(private router: Router, 
    private api: ApiService, 
    private snackBar: MatSnackBar, 
    private browserAnimationsModule: BrowserAnimationsModule,
    private cookie: CookieService) {}


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
  searchUsers(): void {
    // Call the backend API to search for a user by name
    if (this.searchQuery.length != 0)
    {
      this.api.getUserByName(this.searchQuery).subscribe(
        (user: any) => {
          // Handle the user data returned from the backend
          console.log('User Data:', user);
          const userId = user.id;
          this.router.navigate([`/profile/${userId}`]);
          // You can update your component state or perform any other actions with the user data
        },
        (error) => {
          // Handle errors, such as displaying an error message to the user
          let error_message = 'User does not exist'
          this.snackBar.open('Error: ' + error_message, 'Close', {
          duration: 5000, // Duration in milliseconds
        });
        }

      );
    } 
  }
}
