import { Lobby } from './lobby';
import { Server } from 'socket.io';
import { Cron } from '@nestjs/schedule';
import { AuthenticatedSocket } from './types';
import { LOBBY_MAX_LIFETIME } from '../../constants';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LobbyService {

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

    const lobby = new Lobby(this.server, maxClients, modus);
    this.lobbies.set(lobby.id, lobby);
    
    return lobby;
  }

  async joinLobby(player: AuthenticatedSocket, modus: string): Promise<void>
  {
    player.data.modus = modus;
    const availableLobby = Array.from(this.lobbies.values()).find((lobby) => lobby.clients.size < 2 && lobby.modus === modus);
    
    if (availableLobby) {
      availableLobby.addClient(player);
      player.data.position = 'right';
      await availableLobby.finishQueue();
      this.lobbies.delete(availableLobby.id);
    } else {
      const newLobby = this.createLobby(modus);
      newLobby.addClient(player);
      player.data.position = 'left';
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
