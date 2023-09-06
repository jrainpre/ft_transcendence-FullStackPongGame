export interface Dimension {
	height: number;
	width: number;
}

export interface Position {
	x: number;
	y: number;
}

export interface Score {
	playerLeft: number;
	playerRight: number
}

export interface Game {
	ballDimension: Dimension;
	paddleDimension: Dimension;
	score: Score;
	leftPlayerPosition: Position;
	rightPlayerPosition: Position;
	ballPosition: Position;
	margin: number;
}