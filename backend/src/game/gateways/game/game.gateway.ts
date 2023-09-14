import { SubscribeMessage, WebSocketGateway, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
// import { GameService } from '../../services/game/game.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { LobbyService } from '../../services/lobby/lobby.service';
import { Lobby } from 'src/game/services/lobby/lobby';
import { AuthenticatedSocket } from '../../services/lobby/types';
import { StatusController } from 'src/status/status.controller';
import { User } from 'src/entities/user.entity';
import { SendMessageDto } from 'src/messages/dto/send-message.dto';
import { SendUserDto } from 'src/messages/dto/send-user.dto';
import { MessagesService } from 'src/messages/messages.service';

@WebSocketGateway({cors: '*'})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  public logger: Logger = new Logger();
  inst: Lobby;
  lobby_id: string;

  constructor(
    // private statusController: StatusController,
    private readonly messagesService: MessagesService,
    public lobbyManager: LobbyService ) {}
  
  afterInit(server: Server): any {
    this.lobbyManager.server = server;
    this.logger.log('Game server initialized !');
  }


//////////////////////////////////////////////////////////////////
@SubscribeMessage('createMessage')
async createMessage(@MessageBody('message') messageDto: SendMessageDto,) {
const message = await this.messagesService.createNewMessage(messageDto, this.lobbyManager.server);
}

@SubscribeMessage('updateSocketId')
async updateSocketId(@MessageBody('user') userDto: SendUserDto,@ConnectedSocket() client: Socket,) {
const user = await this.messagesService.updateSocketId(userDto, client.id);
const channel = await this.messagesService.joinChannels(user, client);
}
///////////////////////////////////////////////////////////////////


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
  async privateEntry(@ConnectedSocket() client: Socket, @MessageBody() user: any){
    if(user.first == true) {
      user.first = false;
      this.lobby_id = await this.lobbyManager.privateLobby(client, user.modus, user.name, user.id_42, true, '');
      this.logger.log(user.friend_socket_id, 'FRIEND');
      this.logger.log(client.id, 'MAIN');
      this.lobbyManager.server.to(user.friend_socket_id).emit('establishConnection', user);
    } else if(user.first == false) {
      this.lobbyManager.privateLobby(client, user.modus, user.friend_name, user.friend_id_42, false, this.lobby_id);
    }
  }

  @SubscribeMessage('requestLobby')
  entry(@ConnectedSocket() client: Socket, @MessageBody() user: any){
    this.logger.log("JOINED");
    this.lobbyManager.joinLobby(client, user.modus, user.name, user.id_42);
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
    } 
  }
}
