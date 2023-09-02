import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.http.get(`http://localhost:3001/api/auth/42/hello`, { withCredentials: true }).subscribe();
    }
}
