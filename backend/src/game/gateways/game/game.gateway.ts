import { SubscribeMessage, WebSocketGateway, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
// import { GameService } from '../../services/game/game.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { LobbyService } from '../../services/lobby/lobby.service';
import { Lobby } from 'src/game/services/lobby/lobby';
import { AuthenticatedSocket } from '../../services/lobby/types';
import { StatusController } from 'src/status/status.controller';
import { User } from 'src/entities/user.entity';

@WebSocketGateway({cors: '*'})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  public logger: Logger = new Logger();
  inst: Lobby;

  constructor(
    // private statusController: StatusController,
    private lobbyManager: LobbyService) {}
  
  afterInit(server: Server): any {
    this.lobbyManager.server = server;
    this.logger.log('Game server initialized !');
  }

  async handleConnection(client: Socket, ...args: any[]): Promise<void> {
    this.logger.log('Client connected: ', client.id);
    this.lobbyManager.initializeSocket(client as AuthenticatedSocket);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log('Client disconnected: ', client.id);
    for (const lobby of this.lobbyManager.lobbies.values()) {
      if (lobby.clients.has(client.id)) {
        this.logger.log('deleted client');
        lobby.clients.delete(client.id);
        break;
      }
    }

    for (const lobby of this.lobbyManager.lobbies.values()) {
      if (lobby.clients.size === 0) {
        this.lobbyManager.lobbies.delete(lobby.id);
        break;
      }
    }
    this.lobbyManager.terminateSocket(client);
  }

  @SubscribeMessage('privateLobby')
  privateEntry(@ConnectedSocket() client: Socket, @MessageBody() user: any){

  }

  @SubscribeMessage('requestLobby')
  entry(@ConnectedSocket() client: Socket, @MessageBody() user: any){
    this.logger.log("JOINED");
    this.lobbyManager.joinLobby(client, user.modus, user.name, user.id);
  }

  @SubscribeMessage('keyUp')
  keyUp(@MessageBody() key: any, @ConnectedSocket() client: Socket) {
    let targetLobby: Lobby | undefined;

    for (const lobby of this.lobbyManager.lobbies.values()) {
      if (lobby.clients.has(client.id)) {
        targetLobby = lobby;
        break;
      }
    }
  
    if (targetLobby) {
      const playerId = targetLobby.clients.get(client.id);
  
      if (playerId) {
        targetLobby.instance.onKeyUp(client, key);
      } else {
        this.logger.error(`PlayerId not found for client ${client.id}`);
      }
    } else {
      this.logger.error(`Client ${client.id} not found in any lobby.`);
    }
  }

  @SubscribeMessage('keyDown')
  keyDown(@MessageBody() key: any, @ConnectedSocket() client: Socket) {
    let targetLobby: Lobby | undefined;

    for (const lobby of this.lobbyManager.lobbies.values()) {
      if (lobby.clients.has(client.id)) {
        targetLobby = lobby;
        break;
      }
    }
  
    if (targetLobby) {
      const playerId = targetLobby.clients.get(client.id);
  
      if (playerId) {
        targetLobby.instance.onKeyDown(client, key);
      } else {
        this.logger.error(`PlayerId not found for client ${client.id}`);
      }
    } else {
      this.logger.error(`Client ${client.id} not found in any lobby.`);
    }
  }
}
