import { Injectable, HostListener } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { MatchComponent } from '../match/match.component';
import { Game } from '../interface/interface';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  socket: any;
  // running: boolean;
  
  constructor(private router: Router) {
    this.socket = io(environment.socketUrl);
    // this.running = false;
    // this.socket = io('http://192.168.32.68:3001');

    this.socket.on('establishConnection',(user: any) => {
      console.log('HERER');
      this.socket.emit('privateLobby', user);
    });

    this.socket.on('finishedQueue', () => {
      console.log("CONNECTED");
      this.router.navigate(['/match']);
    });

    this.socket.on('returnToStart', () => {
      // this.router.navigate(['/game']);
      window.location.href = '/game';
    });
  }

  sendKeyUp(input: any){
    // console.log(input);
    this.socket.emit('keyUp', input);
  }

  sendKeyDown(input: any){
    // console.log(input);
    this.socket.emit('keyDown', input);
  }

  sendAbort(){
    this.socket.emit('abort');
  }

  sendNewGame(){
    this.socket.emit('newGame', {player: this.socket.id});
  }

  sendStartGame(){
    this.socket.emit('startGame', {player: this.socket.id});
  }

  sendResetAll(){
    this.socket.emit('resetAll');
  }

  requestLobby(modus: string | null, name: string | null, id_42: string | null){
    this.socket.emit('requestLobby', {player: this.socket.id, modus: modus, name: name, id_42: id_42});
  }

  privateLobby(modus: string | null, name: string | null, id_42: string | null, friend_socket_id: string | null, friend_name: string | null, friend_id_42: string | null){
    this.socket.emit('privateLobby', {player: this.socket.id, modus: modus, name: name, id_42: id_42, friend_socket_id: friend_socket_id, friend_name: friend_name, friend_id_42: friend_id_42, first: true});
  }
}