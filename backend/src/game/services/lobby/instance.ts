import { Lobby } from './lobby';
import { Logger } from '@nestjs/common';
import { Paddle, Referee, Game } from '../../ecs/entities';
import { AuthenticatedSocket } from '../../services/lobby/types';

export class NormalInstance
{
	public hasStarted: boolean = false;
	public hasFinished: boolean = false;

	constructor(private readonly lobby: Lobby)
	{
		this.initConstants();
	}

	logger = new Logger(NormalInstance.name);

	playerLeft: Paddle = new Paddle();
	playerRight: Paddle = new Paddle();
	referee: Referee = new Referee();
	game: Game = new Game();
	loopIncrementX: number;
	loopIncrementY: number;

	private gameLoopInterval: NodeJS.Timeout | null = null;

	initConstants(): void {
		this.game.ballDimension.width = 2;
		this.game.ballDimension.height = 3;
		this.game.ballPosition.x = -this.game.ballDimension.width;
		this.game.ballPosition.y = -this.game.ballDimension.height;

		this.game.paddleDimension.height = 20;
		this.game.paddleDimension.width = 1;
		this.game.margin = 3;
		this.game.score.playerLeft = 0;
		this.game.score.playerRight = 0;
		this.referee.moveBall = true;
		this.referee.movePaddle = true;

		this.playerLeft.speed = 1.5;
		this.game.leftPlayerPosition.y = 40;
		this.game.leftPlayerPosition.x = this.game.margin;
		this.playerLeft.increment = 0;

		this.playerRight.speed = 1.5;
		this.game.rightPlayerPosition.y = 40;
		this.game.rightPlayerPosition.x = 100 - this.game.margin - this.game.paddleDimension.width;
		this.playerRight.increment = 0;

		this.loopIncrementX = 0;
		this.loopIncrementY = 0;
	}

  startRound(lobbyId: string): void {
    this.setBall();
    this.loopIncrementX = this.getRandomIncrement();
    this.loopIncrementY = this.getRandomIncrement();
    this.referee.moveBall = true;
    this.referee.movePaddle = true;
    this.moveLeftPaddle(this.playerLeft.increment);
    this.moveRightPaddle(this.playerRight.increment);
    this.moveBall(this.loopIncrementX, this.loopIncrementY, lobbyId);
    this.lobby.dispatchToClient(this.game, lobbyId);
    this.gameLoop(lobbyId);
  }

  gameLoop(lobbyId: string): void {
    // Clear any existing game loop interval
    if (this.gameLoopInterval !== null) {
      clearInterval(this.gameLoopInterval);
    }
  
    this.gameLoopInterval = setInterval(() => {
      this.moveLeftPaddle(this.playerLeft.increment);
      this.moveRightPaddle(this.playerRight.increment);
      this.moveBall(this.loopIncrementX, this.loopIncrementY, lobbyId);
      this.lobby.dispatchToClient(this.game, lobbyId);
    }, 16); // 16 milliseconds for 60 FPS
  }

  stopGameLoop(): void {
    if (this.gameLoopInterval !== null) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
  }

  getRandomIncrement(): number {
    const isNegative = Math.floor(Math.random() * 2) === 1;
    return (0.8 * (isNegative ? -1 : 1));
  }

  setBall(): void {
    this.game.ballPosition.x = 48.5;
    this.game.ballPosition.y = Math.floor(Math.random() * (100 - this.game.ballDimension.height + 1));
  }

  resetAll(): void {
    this.game.score.playerLeft = 0;
    this.game.score.playerRight = 0;
    this.loopIncrementX = 0;
    this.loopIncrementY = 0;
    this.resetBallAndRackets();
  }

  resetBallAndRackets(): void {
    this.game.leftPlayerPosition.y = 40;
    this.game.rightPlayerPosition.y = 40;
    this.game.ballPosition.x = -1 * this.game.ballDimension.width;
    this.game.ballPosition.y = -1 * this.game.ballDimension.height;
    this.referee.moveBall = false;
  }

  moveLeftPaddle(yIncrement: number): void {
    if (!this.referee.movePaddle) {
    return;
    }
    let newY = this.game.leftPlayerPosition.y + yIncrement;
    newY = Math.min(newY, 100 - this.game.paddleDimension.height);
    newY = Math.max(newY, 0);
    this.game.leftPlayerPosition.y = newY;
  }

  moveRightPaddle(yIncrement: number): void {
    if (!this.referee.movePaddle) {
    return;
    }
    let newY = this.game.rightPlayerPosition.y + yIncrement;
    newY = Math.min(newY, 100 - this.game.paddleDimension.height);
    newY = Math.max(newY, 0);
    this.game.rightPlayerPosition.y = newY;
  }

  leftPaddleHit(): boolean {
    const leftPaddleBorder = this.game.leftPlayerPosition.x + this.game.paddleDimension.width;
    const ballCenterY = this.game.ballPosition.y + this.game.ballDimension.height / 2;
    // const ballCenterY = this.game.ballPosition.y + this.game.ballDimension.height;
    return (
    this.game.ballPosition.x <= leftPaddleBorder &&
    this.game.ballPosition.x > this.game.leftPlayerPosition.x &&
    ballCenterY >= (this.game.leftPlayerPosition.y - 3) &&
    ballCenterY <= this.game.leftPlayerPosition.y + (this.game.paddleDimension.height + 3)
    );
  }

  rightPaddleHit(): boolean {
    const ballRightX = this.game.ballPosition.x + this.game.ballDimension.width;
    const paddleRightRightX = this.game.rightPlayerPosition.x + this.game.paddleDimension.width;
    const ballCenterY = this.game.ballPosition.y + this.game.ballDimension.height / 2;
    // const ballCenterY = this.game.ballPosition.y + this.game.ballDimension.height;
    return (
    ballRightX >= this.game.rightPlayerPosition.x &&
    ballRightX < paddleRightRightX &&
    ballCenterY >= (this.game.rightPlayerPosition.y - 3) &&
    ballCenterY <= this.game.rightPlayerPosition.y + (this.game.paddleDimension.height + 3)
    );
  }

  async moveBall(xIncrement: number, yIncrement: number, id: any): Promise<void> {
    if (!this.referee.moveBall) {
      return;
    }
    this.game.ballPosition.x += xIncrement;
    this.game.ballPosition.y += yIncrement;

    if (this.BallWallsCollision()) {
      this.loopIncrementY *= -1;
    }

    if (this.leftPaddleHit()) {
    // this.loopIncrementX *= 1.2;
      this.loopIncrementX *= -1;
    } else if (this.rightPaddleHit()) {
    // this.loopIncrementX *= 1.2;
      this.loopIncrementX *= -1;
    }
    if (this.PlayerLeftScored()) {
      this.game.score.playerLeft++;
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!this.PlayerLeftWin() && !this.PlayerRightWin()) {
      // await this.delay(1000);
        this.stopGameLoop();
        this.startRound(id);
      }
      else {
        this.lobby.updateGameStats(this.game.score, 'left');
        this.resetAll();
        this.stopGameLoop();
        this.lobby.hasFinished = true;
        return;
      }
    } else if (this.PlayerRightScored()) {
      this.game.score.playerRight++;
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!this.PlayerLeftWin() && !this.PlayerRightWin()) {
      // await this.delay(1000);
        this.stopGameLoop();
        this.startRound(id);
      }
      else{ 
        this.lobby.updateGameStats(this.game.score, 'right');
        this.resetAll();
        this.stopGameLoop();
        this.lobby.hasFinished = true;
        return;
      }
    }
  }
		
  onKeyDown(player: AuthenticatedSocket, e: any) {
    if (player.data.position === 'left') {
      if (e.key === 'KeyW' || e.key === 'ArrowUp') {
        this.playerLeft.increment = -this.playerLeft.speed;
      }
      if (e.key === 'KeyS' || e.key === 'ArrowDown') {
        this.playerLeft.increment = this.playerLeft.speed;
      }
    } else if (player.data.position === 'right') {
      if (e.key === 'KeyW' || e.key === 'ArrowUp') {
        this.playerRight.increment = -this.playerRight.speed;
      }
      if (e.key === 'KeyS' || e.key === 'ArrowDown') {
        this.playerRight.increment = this.playerRight.speed;
      }
    }
  }

  onKeyUp(player: AuthenticatedSocket, e: any) {
    if (player.data.position === 'left') {
      if (e.key === 'KeyW' || e.key === 'KeyS' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        this.playerLeft.increment = 0;
      }
    } else if (player.data.position === 'right') {
      if (e.key === 'KeyW' || e.key === 'KeyS' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        this.playerRight.increment = 0;
      }
    }
  }

  BallWallsCollision(): boolean {
    return this.game.ballPosition.y <= 0 || this.game.ballPosition.y + this.game.ballDimension.height >= 100;
  }
		
  PlayerLeftScored(): boolean {
  return this.game.ballPosition.x >= 100;
  }

  PlayerRightScored(): boolean {
  return this.game.ballPosition.x + this.game.ballDimension.width <= 0;
  }

  PlayerLeftWin(): boolean {
  return this.game.score.playerLeft === 10;
  }

  PlayerRightWin(): boolean {
  return this.game.score.playerRight === 10;
  }

	public triggerStart(): void
	{
		if (this.hasStarted) {
		  return;
		}
		this.hasStarted = true;
		this.lobby.dispatchToLobby('Game started !');
	}

	public triggerFinish(): void
	{
		if (this.hasFinished || !this.hasStarted) {
		return;
		}
		this.hasFinished = true;
		this.lobby.dispatchToLobby('Game finished !');
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

export class RankedInstance
{
	public hasStarted: boolean = false;

	public hasFinished: boolean = false;

	constructor(private readonly lobby: Lobby)
	{
		this.initConstants();
	}

	logger = new Logger(RankedInstance.name);

	playerLeft: Paddle = new Paddle();
	playerRight: Paddle = new Paddle();
	referee: Referee = new Referee();
	game: Game = new Game();
	loopIncrementX: number;
	loopIncrementY: number;

	private gameLoopInterval: NodeJS.Timeout | null = null;

	initConstants(): void {
		this.game.ballDimension.width = 2;
		this.game.ballDimension.height = 3;
		this.game.ballPosition.x = -this.game.ballDimension.width;
		this.game.ballPosition.y = -this.game.ballDimension.height;

		this.game.paddleDimension.height = 20;
		this.game.paddleDimension.width = 1;
		this.game.margin = 3;
		this.game.score.playerLeft = 0;
		this.game.score.playerRight = 0;
		this.referee.moveBall = true;
		this.referee.movePaddle = true;

		this.playerLeft.speed = 1.5;
		this.game.leftPlayerPosition.y = 40;
		this.game.leftPlayerPosition.x = this.game.margin;
		this.playerLeft.increment = 0;

		this.playerRight.speed = 1.5;
		this.game.rightPlayerPosition.y = 40;
		this.game.rightPlayerPosition.x = 100 - this.game.margin - this.game.paddleDimension.width;
		this.playerRight.increment = 0;

		this.loopIncrementX = 0;
		this.loopIncrementY = 0;
	}

  startRound(lobbyId: string): void {
    this.setBall();
    this.loopIncrementX = this.getRandomIncrement();
    this.loopIncrementY = this.getRandomIncrement();
    this.referee.moveBall = true;
    this.referee.movePaddle = true;
    this.moveLeftPaddle(this.playerLeft.increment);
    this.moveRightPaddle(this.playerRight.increment);
    this.moveBall(this.loopIncrementX, this.loopIncrementY, lobbyId);
    this.lobby.dispatchToClient(this.game, lobbyId);
    this.gameLoop(lobbyId);
  }

  gameLoop(lobbyId: string): void {
    // Clear any existing game loop interval
    if (this.gameLoopInterval !== null) {
      clearInterval(this.gameLoopInterval);
    }
    this.gameLoopInterval = setInterval(() => {
      this.moveLeftPaddle(this.playerLeft.increment);
      this.moveRightPaddle(this.playerRight.increment);
      this.moveBall(this.loopIncrementX, this.loopIncrementY, lobbyId);
      this.lobby.dispatchToClient(this.game, lobbyId);
    }, 16); // 16 milliseconds for 60 FPS
  }

  stopGameLoop(): void {
    if (this.gameLoopInterval !== null) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
  }

  getRandomIncrement(): number {
    const isNegative = Math.floor(Math.random() * 2) === 1;
    return (0.8 * (isNegative ? -1 : 1));
  }

  setBall(): void {
    this.game.ballPosition.x = 48.5;
    this.game.ballPosition.y = Math.floor(Math.random() * (100 - this.game.ballDimension.height + 1));
  }

  resetAll(): void {
    this.game.score.playerLeft = 0;
    this.game.score.playerRight = 0;
    this.loopIncrementX = 0;
    this.loopIncrementY = 0;
    this.resetBallAndRackets();
  }

  resetBallAndRackets(): void {
    this.game.leftPlayerPosition.y = 40;
    this.game.rightPlayerPosition.y = 40;
    this.game.ballPosition.x = -1 * this.game.ballDimension.width;
    this.game.ballPosition.y = -1 * this.game.ballDimension.height;
    this.referee.moveBall = false;
  }

  moveLeftPaddle(yIncrement: number): void {
    if (!this.referee.movePaddle) {
    return;
    }
    let newY = this.game.leftPlayerPosition.y + yIncrement;
    newY = Math.min(newY, 100 - this.game.paddleDimension.height);
    newY = Math.max(newY, 0);
    this.game.leftPlayerPosition.y = newY;
  }

  moveRightPaddle(yIncrement: number): void {
    if (!this.referee.movePaddle) {
    return;
    }
    let newY = this.game.rightPlayerPosition.y + yIncrement;
    newY = Math.min(newY, 100 - this.game.paddleDimension.height);
    newY = Math.max(newY, 0);
    this.game.rightPlayerPosition.y = newY;
  }

  leftPaddleHit(): boolean {
    const leftPaddleBorder = this.game.leftPlayerPosition.x + this.game.paddleDimension.width;
    const ballCenterY = this.game.ballPosition.y + this.game.ballDimension.height / 2;
    // const ballCenterY = this.game.ballPosition.y + this.game.ballDimension.height;
    return (
    this.game.ballPosition.x <= leftPaddleBorder &&
    this.game.ballPosition.x > this.game.leftPlayerPosition.x &&
    ballCenterY >= (this.game.leftPlayerPosition.y - 3) &&
    ballCenterY <= this.game.leftPlayerPosition.y + (this.game.paddleDimension.height + 3)
    );
  }

  rightPaddleHit(): boolean {
    const ballRightX = this.game.ballPosition.x + this.game.ballDimension.width;
    const paddleRightRightX = this.game.rightPlayerPosition.x + this.game.paddleDimension.width;
    const ballCenterY = this.game.ballPosition.y + this.game.ballDimension.height / 2;
    // const ballCenterY = this.game.ballPosition.y + this.game.ballDimension.height;
    return (
    ballRightX >= this.game.rightPlayerPosition.x &&
    ballRightX < paddleRightRightX &&
    ballCenterY >= (this.game.rightPlayerPosition.y - 3) &&
    ballCenterY <= this.game.rightPlayerPosition.y + (this.game.paddleDimension.height + 3)
    );
  }

  async moveBall(xIncrement: number, yIncrement: number, id: any): Promise<void> {
    if (!this.referee.moveBall) {
      return;
    }
    this.game.ballPosition.x += xIncrement;
    this.game.ballPosition.y += yIncrement;

    if (this.BallWallsCollision()) {
      this.loopIncrementY *= -1;
    }

    if (this.leftPaddleHit()) {
      this.loopIncrementX *= 1.2;
      this.loopIncrementX *= -1;
    } else if (this.rightPaddleHit()) {
      this.loopIncrementX *= 1.2;
      this.loopIncrementX *= -1;
    }
    if (this.PlayerLeftScored()) {
      this.game.score.playerLeft++;
      this.stopGameLoop();
      this.resetBallAndRackets();
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.gameLoop(this.lobby.id);
      if (!this.PlayerLeftWin() && !this.PlayerRightWin()) {
      // await this.delay(1000);
        this.stopGameLoop();
        this.startRound(id);
      }
      else {
        this.lobby.updateGameStats(this.game.score, 'left');
        this.resetAll();
        this.stopGameLoop();
        this.lobby.hasFinished = true;
        return;
      }
    } else if (this.PlayerRightScored()) {
      this.game.score.playerRight++;
      this.stopGameLoop();
      this.resetBallAndRackets();
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.gameLoop(this.lobby.id);
      if (!this.PlayerLeftWin() && !this.PlayerRightWin()) {
      // await this.delay(1000);
        this.stopGameLoop();
        this.startRound(id);
      }
      else{ 
        this.lobby.updateGameStats(this.game.score, 'right');
        this.resetAll();
        this.stopGameLoop();
        this.lobby.hasFinished = true;
        return;
      }
    }
  }
		
  onKeyDown(player: AuthenticatedSocket, e: any) {
    if (player.data.position === 'left') {
      if (e.key === 'KeyW' || e.key === 'ArrowUp') {
        this.playerLeft.increment = -this.playerLeft.speed;
      }
      if (e.key === 'KeyS' || e.key === 'ArrowDown') {
        this.playerLeft.increment = this.playerLeft.speed;
      }
    } else if (player.data.position === 'right') {
      if (e.key === 'KeyW' || e.key === 'ArrowUp') {
        this.playerRight.increment = -this.playerRight.speed;
      }
      if (e.key === 'KeyS' || e.key === 'ArrowDown') {
        this.playerRight.increment = this.playerRight.speed;
      }
    }
  }

  onKeyUp(player: AuthenticatedSocket, e: any) {
    if (player.data.position === 'left') {
      if (e.key === 'KeyW' || e.key === 'KeyS' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        this.playerLeft.increment = 0;
      }
    } else if (player.data.position === 'right') {
      if (e.key === 'KeyW' || e.key === 'KeyS' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        this.playerRight.increment = 0;
      }
    }
  }

  BallWallsCollision(): boolean {
    return this.game.ballPosition.y <= 0 || this.game.ballPosition.y + this.game.ballDimension.height >= 100;
  }
		
  PlayerLeftScored(): boolean {
  return this.game.ballPosition.x >= 100;
  }

  PlayerRightScored(): boolean {
  return this.game.ballPosition.x + this.game.ballDimension.width <= 0;
  }

  PlayerLeftWin(): boolean {
  return this.game.score.playerLeft === 10;
  }

  PlayerRightWin(): boolean {
  return this.game.score.playerRight === 10;
  }

	public triggerStart(): void
	{
		if (this.hasStarted) {
		  return;
		}
		this.hasStarted = true;
		this.lobby.dispatchToLobby('Game started !');
	}

	public triggerFinish(): void
	{
		if (this.hasFinished || !this.hasStarted) {
		return;
		}
		this.hasFinished = true;
		this.lobby.dispatchToLobby('Game finished !');
	}
}