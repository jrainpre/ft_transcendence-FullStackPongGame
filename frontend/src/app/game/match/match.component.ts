import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { WebSocketService } from '../websocket/websocket.service';
import { io } from 'socket.io-client';
import { Game } from '../interface/interface';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { fromEvent, Subject } from 'rxjs';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.svg',
  styleUrls: ['./match.component.scss'],
})
export class MatchComponent implements OnInit {

  constructor(
    private websocketService: WebSocketService,
    private param: ActivatedRoute,
    private router: Router) {

    this.websocketService.sendStartGame();

    websocketService.socket.on('updateGame', (game: Game, userOne: string, userTwo: string) => {
      this.updateGame(game, userOne, userTwo);
    });
  }

  private unsubscriber : Subject<void> = new Subject<void>();
  
  ngOnInit(): void {
    history.pushState(null, '');
  
    fromEvent(window, 'popstate').pipe(
      takeUntil(this.unsubscriber)
    ).subscribe((_) => {
      history.pushState(null, '');
      console.log('Socket disconected: ', this.websocketService.socket.id);
      this.websocketService.socket.emit('backButton');
    });
  }

  // async ngOnDestroy(){
  //   console.log('Socket disconected: ', this.websocketService.socket.id);
  //   this.websocketService.socket.emit('backButton');
  //   await new Promise(resolve => setTimeout(resolve, 5000));
  // }

  // constants
  ballRadius = 1;
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
  userOne: string = '';
  userTwo: string = '';

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    this.websocketService.sendKeyDown({ key: event.code });
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.websocketService.sendKeyUp({ key: event.code });
  }

  updateGame(game: Game, userOne: string, userTwo: string) {
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
    this.userOne = userOne;
    this.userTwo = userTwo;
  }
}
