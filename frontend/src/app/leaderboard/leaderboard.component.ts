import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';

interface Player {
  name: string;
  win_ranked: number;
  loss_ranked: number;
  winLossRatio: number;
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})


export class LeaderboardComponent {
  players: any[] = [];
  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {}

  // get all the players from the database
  async ngOnInit(): Promise<void> {
    try {
      // Fetch players from the API
      const playersData: Player[] = await this.api.getPlayers(); // Annotate the type here
      console.log(playersData);
      // Map the data to extract only the needed properties
      this.players = playersData.map((player: Player) => ({ // Annotate the type here
        name: player.name,
        wins: player.win_ranked,
        losses: player.loss_ranked,
        winLossRatio: 0,
      }))
      playersData.forEach(player => {
        player.winLossRatio = player.loss_ranked === 0 ? player.win_ranked : player.win_ranked / player.loss_ranked;
      });

      // Sort players by win/loss ratio in descending order
      this.players = playersData.sort((a, b) => b.winLossRatio - a.winLossRatio);
      ;
    } catch (error) {
      console.error('Error fetching players:', error);
    }

    
  }


  /* //fake player data for testing
  players = [
    { name: 'Player 1', wins: 10, losses: 5 },
    { name: 'Player 2', wins: 8, losses: 7 },
    { name: 'Player 3', wins: 12, losses: 3 },
  ]; */
}
