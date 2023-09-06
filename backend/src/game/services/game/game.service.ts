import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Paddle, Referee, Game } from '../../ecs/entities';

@Injectable()
export class GameService {
	logger = new Logger(GameService.name);

  	playerLeft: Paddle = new Paddle();
  	playerRight: Paddle = new Paddle();
  	referee: Referee = new Referee();
	game: Game = new Game();
	loopIncrementX: number;
	loopIncrementY: number;

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

		this.playerLeft.speed = 2;
		this.game.leftPlayerPosition.y = 40;
		this.game.leftPlayerPosition.x = this.game.margin;
		this.playerLeft.increment = 0;

		this.playerRight.speed = 2;
		this.game.rightPlayerPosition.y = 40;
		this.game.rightPlayerPosition.x = 100 - this.game.margin - this.game.paddleDimension.width;
		this.playerRight.increment = 0;

		this.loopIncrementX = 0;
		this.loopIncrementY = 0;
	}

	newGame(): Game {
		this.initConstants();
		this.resetAll();
		return this.startRound();
	}

	startRound(): Game {
		this.setBall();
		this.loopIncrementX = this.getRandomIncrement();
		this.loopIncrementY = this.getRandomIncrement();
		this.referee.moveBall = true;
		this.referee.movePaddle = true;
		this.moveLeftPaddle(this.playerLeft.increment);
		this.moveRightPaddle(this.playerRight.increment);
		this.moveBall(this.loopIncrementX, this.loopIncrementY);
		return this.game;
	}

	gameLoop(): Game {
		this.moveLeftPaddle(this.playerLeft.increment);
		this.moveRightPaddle(this.playerRight.increment);
		this.moveBall(this.loopIncrementX, this.loopIncrementY);
		return this.game;
	}

	getRandomIncrement(): number {
		const isNegative = Math.floor(Math.random() * 2) === 1;
		// console.log(isNegative);
		return ((Math.floor(Math.random() * 3) + 3) * (isNegative ? -1 : 1)) / 5;
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

	// ballPaddleCollision(xIncrement: number): number {
	// 	if (
	// 	  this.game.ballPosition.x <= this.game.margin + this.game.paddleDimension.width ||
	// 	  this.game.ballPosition.x + this.game.ballDimension.width >= 100 - this.game.margin - this.game.paddleDimension.width
	// 	) {
	// 	  return -1 * xIncrement;
	// 	} else {
	// 	  return xIncrement;
	// 	}
	// }

	// leftPaddleHitVertTop(): boolean {
	// 	const leftPaddleBorder = this.game.leftPlayerPosition.x + this.game.paddleDimension.width;
	// 	return(
	// 		(this.game.ballPosition.x >= this.game.leftPlayerPosition.x && this.game.ballPosition.x <= leftPaddleBorder) &&
	// 		(this.game.ballPosition.y + this.game.ballDimension.height == this.game.ballPosition.y) //&&
	// 		// (this.game.ballPosition.y <= this.game.leftPlayerPosition.y - 10)
	// 	);
	// }

	// leftPaddleHitVertBot(): boolean {
	// 	const leftPaddleBorder = this.game.leftPlayerPosition.x + this.game.paddleDimension.width;
	// 	return(
	// 		(this.game.ballPosition.x >= this.game.leftPlayerPosition.x && this.game.ballPosition.x <= leftPaddleBorder) &&
	// 		((this.game.ballPosition.y <= this.game.ballPosition.y + this.game.paddleDimension.height))
	// 	);
	// }

	// rightPaddleHitVert(): boolean {
	// 	const rightPaddleBorder = this.game.rightPlayerPosition.x - this.game.paddleDimension.width;
	// 	return(
	// 		(this.game.ballPosition.x <= this.game.rightPlayerPosition.x && this.game.ballPosition.x >= rightPaddleBorder) &&
	// 		((this.game.ballPosition.y + this.game.ballDimension.height >= this.game.ballPosition.y) || 
	// 			(this.game.ballPosition.y <= this.game.ballPosition.y + this.game.paddleDimension.height))
	// 	);
	// }

	leftPaddleHit(): boolean {
		const leftPaddleBorder = this.game.leftPlayerPosition.x + this.game.paddleDimension.width;
		const ballCenterY = this.game.ballPosition.y + this.game.ballDimension.height / 2;
		return (
		  this.game.ballPosition.x <= leftPaddleBorder &&
		  this.game.ballPosition.x > this.game.leftPlayerPosition.x &&
		  ballCenterY >= this.game.leftPlayerPosition.y &&
		  ballCenterY <= this.game.leftPlayerPosition.y + this.game.paddleDimension.height
		);
	}

	rightPaddleHit(): boolean {
		const ballRightX = this.game.ballPosition.x + this.game.ballDimension.width;
		const paddleRightRightX = this.game.rightPlayerPosition.x + this.game.paddleDimension.width;
		const ballCenterY = this.game.ballPosition.y + this.game.ballDimension.height / 2;
		return (
		  ballRightX >= this.game.rightPlayerPosition.x &&
		  ballRightX < paddleRightRightX &&
		  ballCenterY >= this.game.rightPlayerPosition.y &&
		  ballCenterY <= this.game.rightPlayerPosition.y + this.game.paddleDimension.height
		);
	}

	async moveBall(xIncrement: number, yIncrement: number): Promise<void> {
		if (!this.referee.moveBall) {
		  return;
		}
		this.game.ballPosition.x += xIncrement;
		this.game.ballPosition.y += yIncrement;
	
		if (this.BallWallsCollision()) {
		  this.loopIncrementY *= -1;
		}
	
		if (this.leftPaddleHit()) {
		  this.loopIncrementX *= -1;
		} else if (this.rightPaddleHit()) {
		  this.loopIncrementX *= -1;
		}
	
		if (this.PlayerLeftScored()) {
		  this.game.score.playerLeft++;
		//   this.referee.leftPlayerPoint = true;
		  if (!this.PlayerLeftWin() && !this.PlayerRightWin()) {
			// await this.delay(1000);
			this.startRound();
		  }
		  else
		  	this.resetAll();
		  return;
		} else if (this.PlayerRightScored()) {
		  this.game.score.playerRight++;
		//   this.referee.leftPlayerPoint = true;
		  if (!this.PlayerLeftWin() && !this.PlayerRightWin()) {
			// await this.delay(1000);
			this.startRound();
		  }
		  else
		  	this.resetAll();
		  return;
		}
	}
	  
	onKeyDown(e: any) {
		// this.logger.log(e.key);
		if (e.key === 'KeyW') {
		this.playerLeft.increment = -this.playerLeft.speed;
		}
		if (e.key === 'KeyS') {
		this.playerLeft.increment = this.playerLeft.speed;
		}
		if (e.key === 'ArrowUp') {
		this.playerRight.increment = -this.playerRight.speed;
		}
		if (e.key === 'ArrowDown') {
		this.playerRight.increment = this.playerRight.speed;
		}
	}

	onKeyUp(e: any) {
		// this.logger.log(e.key);
		if (e.key === 'KeyW' || e.key === 'KeyS') {
		this.playerLeft.increment = 0;
		}
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
		this.playerRight.increment = 0;
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

	async delay(ms: number): Promise<any> {
	return new Promise((f) => setTimeout(f, ms));
	}
}
