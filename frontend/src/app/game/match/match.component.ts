import { Component, HostListener, OnDestroy } from '@angular/core';
import { WebSocketService } from '../websocket/websocket.service';
import { io } from 'socket.io-client';
import { Game } from '../interface/interface';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-match',
  templateUrl: './match.component.svg',
  styleUrls: ['./match.component.scss'],
})
export class MatchComponent implements OnDestroy {

  constructor(
    private websocketService: WebSocketService,
    private param: ActivatedRoute) {

    this.websocketService.sendStartGame();

    websocketService.socket.on('updateGame', (game: Game) => {
      this.updateGame(game);
    });
  }
  
  ngOnDestroy(): void {
    console.log('Socket disconected: ', this.websocketService.socket.id);
  }

  // constants
  ballWidth = 2;
  ballHeight = 3;
  paddleWidth = 1;
  paddleHeight = 20;
  paddleMargin = 3;
  // racketSpeed = 0.7;

  scorePlayerLeft = 0;
  scorePlayerRight = 0;
  playerLeftY = 40;
  playerRightY = 40;
  playerLeftX = this.paddleMargin;
  playerRightX = 100 - this.paddleMargin - this.paddleWidth;
  ballX = -1 * this.ballWidth;
  ballY = -1 * this.ballHeight;
  // canMoveBall = true;
  // canMoveRackets = true;
  // racket0Increment = 0;
  // racket1Increment = 0;


  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Process the key event (e.g., move paddle)
    // Send input to the backend via WebSocket service
    // console.log(event);
    this.websocketService.sendKeyDown({ key: event.code });
    // this.socket.emit('keyDown', { key: event.code });
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    // Process the key event (e.g., move paddle)
    // Send input to the backend via WebSocket service
    // console.log(event);
    this.websocketService.sendKeyUp({ key: event.code });
    // this.socket.emit('keyUp', { key: event.code });
  }

  // startGame(){
  //   this.websocketService.sendStartGame();
  // }

  // newGame(){
  //   this.websocketService.sendNewGame();
  //   // this.socket.emit('newGame'); 
  // }

  // resetAll() {
  //   this.websocketService.sendResetAll();
  //   // this.socket.emit('resetAll');
  // }

  updateGame(game: Game) {
    this.ballX = game.ballPosition.x;
    this.ballY = game.ballPosition.y;
    this.scorePlayerLeft = game.score.playerLeft;
    this.scorePlayerRight = game.score.playerRight;
    this.playerLeftY = game.leftPlayerPosition.y;
    this.playerRightY = game.rightPlayerPosition.y;
    this.playerLeftX = game.leftPlayerPosition.x;
    this.playerRightX = game.rightPlayerPosition.x;
    this.ballWidth = game.ballDimension.width;
    this.ballHeight = game.ballDimension.height;
    this.paddleWidth = game.paddleDimension.width;
    this.paddleHeight = game.paddleDimension.height;
    this.paddleMargin = game.margin;
  }
}
