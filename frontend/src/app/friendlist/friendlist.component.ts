import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.component.html',
  styleUrls: ['./friendlist.component.css']
})
export class FriendlistComponent {
  constructor(private api: ApiService, private router: Router) {}

  friends: { username: string; id_42: string; status: string }[] = [];
  onlineFriends: any[] = [];
  offlineFriends: any[] = [];

  // on init fetch list and sort it
  ngOnInit() {
    this.loadFriends();
  }

  async loadFriends() {
    const id = await this.api.getIdByJwt();
    this.api.getFriends(id).then((response: any) => {
      console.log(response);
      for (let i = 0; i < response.length; i++) {
        // Determine whether the current user is userOne or userTwo
        // and populate the friends array accordingly
        if (response[i].userOne.id_42 === id) {
          this.friends.push({
            username: response[i].userTwo.name,
            id_42: response[i].userTwo.id_42,
            status: response[i].userTwo.status
          });
        } else {
          this.friends.push({
            username: response[i].userOne.name,
            id_42: response[i].userOne.id_42,
            status: response[i].userOne.status
          });
        }
      }
      // Split the sorted friends into online and offline arrays
      this.onlineFriends = this.friends.filter(friend => friend.status === 'online');
      this.offlineFriends = this.friends.filter(friend => friend.status === 'offline');
    });
  }

  goToProfile(id_42: string) {
    this.router.navigate(['/profile', id_42], { queryParams: { reload: 'true'}});
  }
}  
