import { Lobby } from './lobby';
import { Server } from 'socket.io';
import { Cron } from '@nestjs/schedule';
import { AuthenticatedSocket } from './types';
import { LOBBY_MAX_LIFETIME } from '../../constants';
import { Injectable, Logger } from '@nestjs/common';
import { User, UserStatus } from 'src/entities/user.entity';
import { Games, GameType} from 'src/entities/games.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ReturnDocument } from 'typeorm';
import { MessagesService } from 'src/messages/messages.service';

@Injectable()
export class LobbyService {

  constructor(
    @InjectRepository(User)
    readonly user: Repository<User>,
    @InjectRepository(Games)
    readonly game: Repository<Games>,
    private readonly messagesService: MessagesService
  ){}

  public logger: Logger = new Logger();
	public server: Server = new Server();
  readonly lobbies: Map<Lobby['id'], Lobby> = new Map<Lobby['id'], Lobby>();

  public initializeSocket(client: AuthenticatedSocket): void
  {
    client.data.lobby = null;
  }

  public terminateSocket(client: AuthenticatedSocket): void
  {
    client.data.lobby?.removeClient(client);
  }

  public createLobby(modus: string): Lobby
  {
    let maxClients = 2;

    const lobby = new Lobby(this.user, this.game, this.server, maxClients, modus);
    this.lobbies.set(lobby.id, lobby);
    
    return lobby;
  }

  public async cleanUp(client_id: string){
    for (let [lobbyId, lobby] of this.lobbies) {
      for (let [key, client] of lobby.clients.entries()) {
        if (key === client_id){
          lobby.instance.triggerFinish();
          lobby.instance = null;
          this.lobbies.delete(lobby.id);
          return;
        }
      }
    }
  }

  public async cleanUpBackButton(client_id: string){
    for (let [lobbyId, lobby] of this.lobbies) {
      for (let [key, client] of lobby.clients.entries()) {
        if (key === client_id){
          client.leave(lobby.id);
          lobby.instance.terminate();
          delete lobby.instance;
          lobby.instance = null;
          lobby.clients.delete(client_id);
          this.lobbies.delete(lobby.id);
          lobby = null;
          return;
        }
      }
    }
  }

  async privateLobby(player: AuthenticatedSocket, modus: string, name: string, id_42: string, first: boolean, lobby_id: string): Promise<string | null> {
   
    player.data.modus = modus;
    player.data.name = name;
    player.data.id = id_42;

    if(first == true) {

      for (const [lobbyId, lobby] of this.lobbies) {
        for (const [key, client] of lobby.clients.entries()) {
          if (client.data.id === player.data.id){return;}
        }
      }

      const newLobby = this.createLobby(modus);
      newLobby.addClient(player);
      player.data.position = 'left';
      const user = await this.user.findOne({where: { id_42: player.data.id}});
      this.messagesService.markInGame(player.id, this.server);
      return newLobby.id;
    } else if (first == false){

      for (const [lobbyId, lobby] of this.lobbies) {
        for (const [key, client] of lobby.clients.entries()) {
          if (client.data.id === player.data.id){return;}
        }
      }

      const availableLobby = Array.from(this.lobbies.values()).find((lobby) => lobby.id === lobby_id);
      availableLobby.addClient(player);
      player.data.position = 'right';
      const user = await this.user.findOne({where: { id_42: player.data.id}});
      this.messagesService.markInGame(player.id, this.server);


      for (const [key, client] of availableLobby.clients.entries()) {
      }

      await availableLobby.finishQueue();
    }
  }

  async joinLobby(player: AuthenticatedSocket, modus: string, name: string, id_42: string): Promise<void> {
    player.data.modus = modus;
    player.data.name = name;
    player.data.id = id_42;
    const availableLobby = Array.from(this.lobbies.values()).find((lobby) => lobby.clients.size < 2 && lobby.modus === modus);
    
    if (availableLobby) {
      if(player.data.id > 2147483647) {
        this.server.to(availableLobby.id).emit('returnToStart');
        return;
      }

      for (const [key, client] of availableLobby.clients.entries()) {
        if(client.data.id === player.data.id) {return;}
      }

      for (const [lobbyId, lobby] of this.lobbies) {
        for (const [key, client] of lobby.clients.entries()) {
          if (client.data.id === player.data.id){return;}
        }
      }

      player.data.position = 'right';
      availableLobby.addClient(player);
      const user = await this.user.findOne({where: { id_42: player.data.id}});
      this.messagesService.markInGame(player.id, this.server);

      await availableLobby.finishQueue();
      this.lobbies.delete(availableLobby.id);
    } else {
      if(player.data.id > 2147483647) {
        this.server.to(availableLobby.id).emit('returnToStart');
        return;
      }

      for (const [lobbyId, lobby] of this.lobbies) {
        for (const [key, client] of lobby.clients.entries()) {
          if (client.data.id === player.data.id){return;}
        }
      }

      const newLobby = this.createLobby(modus);
      player.data.position = 'left';
      newLobby.addClient(player);
      const user = await this.user.findOne({where: { id_42: player.data.id}});
      this.messagesService.markInGame(player.id, this.server);

    }
  }

  // Periodically clean up lobbies
  @Cron('*/5 * * * *')
  private lobbiesCleaner(): void
  {
    for (const [lobbyId, lobby] of this.lobbies) {
      const now = (new Date()).getTime();
      const lobbyCreatedAt = lobby.createdAt.getTime();
      const lobbyLifetime = now - lobbyCreatedAt;

      if (lobbyLifetime > LOBBY_MAX_LIFETIME) {
        lobby.dispatchToLobby('Game timed out');
        lobby.instance.triggerFinish();
        this.lobbies.delete(lobby.id);
      }
    }
  }
}
