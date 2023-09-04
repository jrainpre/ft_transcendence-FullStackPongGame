import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-match-history',
  templateUrl: './match-history.component.html',
  styleUrls: ['./match-history.component.css']
})

export class MatchHistoryComponent {
  
  matches: { id: number, created_at: Date, playerOne: string, playerTwo: string, player_one_score: number, player_two_score: number, winner: string, type: string, playerOneId: string, playerTwoId: string, winnerId: string }[] = [];
  currentPage = 1;
  gamesPerPage = 10;
  displayedGames: any[] = [];
  dataLoaded = false; // Flag to track data loading

  constructor(private api: ApiService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.loadMatches();
      this.dataLoaded = true; // Set the flag to indicate data is loaded
      this.updateDisplayedGames();
    }
    catch (error) {
      console.error('Error fetching matches:', error);
    }
  }
      

  async loadMatches() {
    await this.api.loadAllMatches().then((response: any) => {
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
          winnerId: response[i].winner.id_42
        });
      }
    });
    this.matches.sort((a, b) => {
      return +new Date(b.created_at) - +new Date(a.created_at);
    });        
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
