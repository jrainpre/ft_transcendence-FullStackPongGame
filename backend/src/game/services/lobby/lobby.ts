import { v4 } from 'uuid';
import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket } from './types';
import { NormalInstance, RankedInstance } from './instance';
import { Game } from '../../ecs/entities';
import { Logger } from '@nestjs/common';

export class Lobby
{
  public modus: string;
  public readonly id: string = v4();
  public readonly createdAt: Date = new Date();
  public readonly clients: Map<Socket['id'], Socket> = new Map<Socket['id'], Socket>();
  public readonly instance: any;
  public hasFinished: boolean = false;

  constructor(private readonly server: Server, public readonly maxClients: number, modus: string) {
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
        this.server.to(this.id).emit('returnToStart');
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}