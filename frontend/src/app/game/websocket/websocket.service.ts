import { Injectable, HostListener } from '@angular/core';
import { io } from 'socket.io-client';
import { MatchComponent } from '../match/match.component';
import { Game } from '../interface/interface';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  socket: any;
  // running: boolean;
  
  constructor() {
    this.socket = io('http://10.11.2.5:3001');
    // this.running = false;
  }

  // @HostListener('window:keydown', ['$event'])
  // onKeyDown(event: KeyboardEvent) {
  //   // Process the key event (e.g., move paddle)
  //   // Send input to the backend via WebSocket service
  //   console.log(event);
  //   // this.websocketService.sendKeyDown({ key: event.code });
  //   this.socket.emit('keyDown', { key: event.code });
  // }

  // @HostListener('window:keyup', ['$event'])
  // onKeyUp(event: KeyboardEvent) {
  //   // Process the key event (e.g., move paddle)
  //   // Send input to the backend via WebSocket service
  //   console.log(event);
  //   // this.websocketService.sendKeyUp({ key: event.code });
  //   this.socket.emit('keyUp', { key: event.code });
  // }

  sendKeyUp(input: any){
    // console.log(input);
    this.socket.emit('keyUp', input);
  }

  sendKeyDown(input: any){
    // console.log(input);
    this.socket.emit('keyDown', input);
  }

  sendNewGame(){
    // if (this.running === false) {
    //   this.running = true;
    // }
    this.socket.emit('newGame', {player: this.socket.id});
  }

  sendStartGame(){
    this.socket.emit('startGame', {player: this.socket.id});
  }

  sendResetAll(){
    this.socket.emit('resetAll');
  }

  requestLobby(modus: string | null){
    this.socket.emit('requestLobby', {player: this.socket.id, modus: modus});
  }
}