import { v4 } from 'uuid';
import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket } from './types';
import { NormalInstance, RankedInstance } from './instance';
import { Game } from '../../ecs/entities';
import { Logger } from '@nestjs/common';
import { User, UserStatus } from 'src/entities/user.entity';
import { Games, GameType} from 'src/entities/games.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score } from '../../ecs/components';

export class Lobby
{
  public modus: string;
  public readonly id: string = v4();
  public readonly createdAt: Date = new Date();
  public readonly clients: Map<Socket['id'], Socket> = new Map<Socket['id'], Socket>();
  public readonly instance: any;
  public hasFinished: boolean = false;
  
  constructor(
    // @InjectRepository(User)
    readonly user: Repository<User>,
    // @InjectRepository(Games)
    readonly game: Repository<Games>,
    
    private readonly server: Server,
    public readonly maxClients: number,
    modus: string,
    ) {
    this.modus = modus;

    switch(modus) {
      case 'ranked':
        this.instance = new RankedInstance(this);
        break;
      case 'normal':
        this.instance = new NormalInstance(this);
        break;
      default:
        this.instance = new NormalInstance(this);
    }
  }

  public logger: Logger = new Logger();

  public addClient(client: AuthenticatedSocket): void
  {
    this.clients.set(client.id, client);
    client.join(this.id);
    client.data.lobby = this;

    if (this.clients.size >= this.maxClients) {
      this.instance.triggerStart();
    }
  }

  removeClient(player: [Socket['id'], Socket]) {
    this.clients.delete(player[0]);
  }

  endGame() {
    for (const client of this.clients) {
      this.removeClient(client);
    }
  }

  public async updateGameStats(score: Score, winner: string): Promise<void> {
    const games = new Games();
    games.player_one_score = score.playerLeft;
    games.player_two_score = score.playerRight;

    for (const [socketId, socket] of this.clients) {
      const user = await this.user.findOne({where: { id_42: socket.data.id }});

      if(socket.data.position === 'left'){games.playerOne = user;}
      else if (socket.data.position === 'right'){games.playerTwo = user;}
      
      user.status = UserStatus.ONLINE;
      await this.user.save(user);
    }

    games.type = (this.modus === 'normal') ? GameType.NORMAL : GameType.RANKED;
    games.winner = (winner === 'left') ? games.playerOne : games.playerTwo;
    await this.game.save(games);
  }

  public dispatchToLobby(event: any): void
  {
    this.server.to(this.id).emit(event);
  }

  public dispatchToClient(game: Game, loobyId: string): void
  {
    this.server.to(loobyId).emit('updateGame', game);
  }

  public async finishQueue(){
    this.server.to(this.id).emit('finishedQueue');
    await new Promise(resolve => setTimeout(resolve, 3000));
    this.instance.startRound(this.id);

    while(1) {
      if(this.hasFinished === true) {
        this.logger.log("Finsihed");
        this.endGame();
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.server.to(this.id).emit('returnToStart');
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}