import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WebSocketService } from '../websocket/websocket.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent {
   constructor(private router: Router, private websocketService: WebSocketService) {}

   async loading(modus: string){
      this.router.navigate(['/loading', modus]);
    // await new Promise(resolve => setTimeout(resolve, 3000));
    // this.router.navigate(['/match']);
   }
}
