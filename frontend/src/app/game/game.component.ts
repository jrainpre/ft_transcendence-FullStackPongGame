import { Router } from '@angular/router'
import { Component } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  constructor(private router: Router) {}
  ngOnInit(): void {
      this.router.navigate(['/lobby']);
    }
}
