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
  public readonly clients: Map<Socket['id'], AuthenticatedSocket> = new Map<Socket['id'], AuthenticatedSocket>();
  public instance: any;
  public hasFinished: boolean = false;
  public games = new Games();
  
  constructor(
    readonly user: Repository<User>,
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

  public async updateGameStats(score: Score, winner: string, games: Games): Promise<void> {
    games.player_one_score = score.playerLeft;
    games.player_two_score = score.playerRight;

    for (const [socketId, socket] of this.clients) {
      const user = await this.user.findOne({where: { id_42: socket.data.id }});

      if(socket.data.position === 'left'){
        if(winner === 'left') {
          if(socket.data.modus === 'normal'){
            user.win_normal += 1;
            user.games_played_normal += 1;
          }else if(socket.data.modus === 'ranked'){
            user.win_ranked += 1;
            user.games_played_ranked += 1;
          }
        }
        else{
          if(socket.data.modus === 'normal'){
            user.loss_normal += 1;
            user.games_played_normal += 1;
          }else if(socket.data.modus === 'ranked'){
            user.loss_ranked += 1;
            user.games_played_ranked += 1;
          }
        }
      }
      else if (socket.data.position === 'right'){
        if(winner === 'right') {
          if(socket.data.modus === 'normal'){
            user.win_normal += 1;
            user.games_played_normal += 1;
          }else if(socket.data.modus === 'ranked'){
            user.win_ranked += 1;
            user.games_played_ranked += 1;
          }
        }
        else{
          if(socket.data.modus === 'normal'){
            user.loss_normal += 1;
            user.games_played_normal += 1;
          }else if(socket.data.modus === 'ranked'){
            user.loss_ranked += 1;
            user.games_played_ranked += 1;
          }
        }
      }
      
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
    let userOne: User = new User;
    let userTwo: User = new User;

    const authenticatedSockets: AuthenticatedSocket[] = Array.from(this.clients.values());
    if(authenticatedSockets[0].data.position === 'left'){
      userOne = await this.user.findOne({where: { id_42: authenticatedSockets[0].data.id }});
      userTwo = await this.user.findOne({where: { id_42: authenticatedSockets[1].data.id }});
    } else {
      userOne = await this.user.findOne({where: { id_42: authenticatedSockets[1].data.id }});
      userTwo = await this.user.findOne({where: { id_42: authenticatedSockets[0].data.id }});
    }

    this.games.playerOne = userOne;
    this.games.playerTwo = userTwo;
    await this.game.save(this.games);

    const room = this.server.sockets.adapter.rooms.get(this.id);

    if (room) {
    const socketIds = Array.from(room);
    this.logger.log(`Clients connected to room ${this.id}:`, socketIds);
    } else {
      this.logger.log(`Room ${this.id} does not exist or has no clients.`);
    }

    this.server.to(this.id).emit('finishedQueue');
    await new Promise(resolve => setTimeout(resolve, 3000));
    this.instance.startRound(this.id, this.games);

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