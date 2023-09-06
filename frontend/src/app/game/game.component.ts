// import { Router } from '@angular/router'
// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-game',
//   templateUrl: './game.component.html',
//   styleUrls: ['./game.component.css']
// })
// export class GameComponent {
//   constructor(private router: Router) {}
//   ngOnInit(): void {
//       this.router.navigate(['/lobby']);
//     }
// }
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WebSocketService } from './websocket/websocket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
   constructor(private router: Router, private websocketService: WebSocketService) {}

   async loading(modus: string){
      this.router.navigate(['/loading', modus]);
    // await new Promise(resolve => setTimeout(resolve, 3000));
    // this.router.navigate(['/match']);
   }
}
