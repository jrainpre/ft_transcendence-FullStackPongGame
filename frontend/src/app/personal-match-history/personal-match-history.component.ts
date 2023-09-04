import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-personal-match-history',
  templateUrl: './personal-match-history.component.html',
  styleUrls: ['./personal-match-history.component.css']
})
export class PersonalMatchHistoryComponent {
  matches: { id: number, created_at: Date, playerOne: string, playerTwo: string, player_one_score: number, player_two_score: number, winner: string, type: string, playerOneId: string, playerTwoId: string, winnerId: string }[] = [];
  currentPage = 1;
  gamesPerPage = 10;
  displayedGames: any[] = [];
  dataLoaded = false; // Flag to track data loading

  constructor(private api: ApiService, private router: Router, private profileComponent: ProfileComponent) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.loadMatches();
      this.dataLoaded = true; // Set the flag to indicate data is loaded
      this.updateDisplayedGames();
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  
    this.profileComponent.reloadPersonalMatchHistory$.subscribe(async () => {
      // Reload your data here
      try {
        await this.reloadMatches(); // Call a separate async function
        this.dataLoaded = true; // Set the flag to indicate data is loaded
        this.updateDisplayedGames();
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    });
  }

  async reloadMatches() {
    try {
      await this.loadMatches();
      this.dataLoaded = true; // Set the flag to indicate data is loaded
      this.updateDisplayedGames();
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  }

      
  async loadMatches() {
    const currentUrl = window.location.href; // Get the current URL
    const id = this.extractIdFromUrl(currentUrl);
  
    if (id !== null) {
      // Only call api.loadUserMatches(id) if 'id' is not null
      await this.api.loadUserMatches(id).then((response: any) => {
        console.log(response);
        for (let i = 0; i < response.length; i++) {
          this.matches.push({
            id: response[i].id,
            created_at: response[i].created_at,
            playerOne: response[i].playerOne.name,
            playerTwo: response[i].playerTwo.name,
            player_one_score: response[i].player_one_score,
            player_two_score: response[i].player_two_score,
            winner: response[i].winner.name,
            type: response[i].type,
            playerOneId: response[i].playerOne.id_42,
            playerTwoId: response[i].playerTwo.id_42,
            winnerId: response[i].winner.id_42,
          });
        }
      });
      this.matches.sort((a, b) => {
        return +new Date(b.created_at) - +new Date(a.created_at);
      });
    } else {
      // Handle the case where 'id' is null (e.g., show an error message)
      console.log("ID is null. Handle the error case here.");
    }
  }
  
  // Function to extract 'id' from the URL
  extractIdFromUrl(url: string): string | null {
    // Use a regular expression to match and extract the 'id' part
    const match = url.match(/\/profile\/(\d+)$/);
  
    if (match && match[1]) {
      return match[1]; // The extracted 'id' as a string
    } else {
      return null; // 'id' not found in the URL
    }
  }
  

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedGames();
    }
  }
  
  nextPage() {
    const totalPages = Math.ceil(this.matches.length / this.gamesPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.updateDisplayedGames();
    }
  }
  
  updateDisplayedGames() {
    if (this.dataLoaded) { // Only update when data is loaded
      const startIndex = (this.currentPage - 1) * this.gamesPerPage;
      const endIndex = startIndex + this.gamesPerPage;
      this.displayedGames = this.matches.slice(startIndex, endIndex);
      console.log('Displayed Games:', this.displayedGames); // Debug statement
    }
  }
  

  changePageSize(event: any) {
    const size = event.target.value;
    if (size === 'all') {
      this.gamesPerPage = this.matches.length;
    } else {
      this.gamesPerPage = parseInt(size, 10);
    }
    this.currentPage = 1;
    this.updateDisplayedGames();
  }

  goToProfile(id_42: number) {
    this.router.navigate(['/profile', id_42]);
  }
}
