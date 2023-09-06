import { Position, Role, Dimension, Score } from './components';

export class Paddle {
  // role: Role;
  speed: number = 0;
  increment: number = 0;
}

export class Referee {
  moveBall: boolean = true;
  movePaddle: boolean = true;
  // leftPlayerPoint: boolean = false;
  // rightPlayerPoint: boolean = false;
}

export class World {
  dimension: Dimension = { width: 0, height: 0 };
}

export class Game {
  ballDimension: Dimension = { width: 0, height: 0 };
  paddleDimension: Dimension = { width: 0, height: 0 };
  score: Score = { playerLeft: 0, playerRight: 0 };
  leftPlayerPosition: Position = {x: 0, y: 0 };
  rightPlayerPosition: Position = {x: 0, y: 0 };
  ballPosition: Position = { x: 0, y: 0 };
  margin: number = 0;
}
