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

@Injectable()
export class LobbyService {

  constructor(
    @InjectRepository(User)
    readonly user: Repository<User>,
    @InjectRepository(Games)
    readonly game: Repository<Games>,
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

  async privateLobby(player: AuthenticatedSocket, modus: string, name: string, id_42: string, friend_socket_id: string, friend_name: string, friend_id_42: string): Promise<void> {
    let player1: AuthenticatedSocket;
    player1.data.modus = modus;
    player1.data.name = friend_name;
    player1.data.id = friend_id_42;
    player.data.modus = modus;
    player.data.name = name;
    player.data.id = id_42;

    const newLobby = this.createLobby(modus);
    newLobby.addClient(player);
    newLobby.addClient(player1);
    player.data.position = 'left';
    player1.data.position = 'right';
    const user = await this.user.findOne({where: { id_42: player.data.id}});
    const user1 = await this.user.findOne({where: { id_42: player1.data.id}});
    user.status = UserStatus.INGAME;
    user1.status = UserStatus.INGAME;
    await this.user.save(user);
    await this.user.save(user1);
    await newLobby.finishQueue();
  }

  async joinLobby(player: AuthenticatedSocket, modus: string, name: string, id_42: string): Promise<void> {
    player.data.modus = modus;
    player.data.name = name;
    player.data.id = id_42;
    const availableLobby = Array.from(this.lobbies.values()).find((lobby) => lobby.clients.size < 2 && lobby.modus === modus);
    
    if (availableLobby) {

      // for (const [key, client] of availableLobby.clients.entries()) {
      //   if(client.data.id === player.data.id) {return;}
      // }

      player.data.position = 'right';
      availableLobby.addClient(player);
      const user = await this.user.findOne({where: { id_42: player.data.id}});
      user.status = UserStatus.INGAME;
      await this.user.save(user);
      await availableLobby.finishQueue();
      this.lobbies.delete(availableLobby.id);
    } else {
      const newLobby = this.createLobby(modus);
      player.data.position = 'left';
      newLobby.addClient(player);
      const user = await this.user.findOne({where: { id_42: player.data.id}});
      user.status = UserStatus.INGAME;
      await this.user.save(user);
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
