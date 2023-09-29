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
import { send } from 'process';


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
  }


//////////////////////////////////////////////////////////////////
@SubscribeMessage('createMessage')
async createMessage(@MessageBody('message') messageDto: SendMessageDto,) {
  this.logger.log('MESSAGE lets go');
const message = await this.messagesService.createNewMessage(messageDto, this.lobbyManager.server);
}

@SubscribeMessage('updateSocketId')
async updateSocketId(@MessageBody('user') userDto: SendUserDto,@ConnectedSocket() client: Socket,) {
const user = await this.messagesService.updateSocketId(userDto, client.id, this.lobbyManager.server);
if (user)
{
  await this.messagesService.markConnected(client.id, this.lobbyManager.server);
  const channel = await this.messagesService.joinChannels(user, client);
}
}

@SubscribeMessage('gameInvite')
async inviteGame(@MessageBody('user') userDto: SendUserDto,@ConnectedSocket() client: Socket,) {
  // this.messagesService.markInGame(client.id, this.lobbyManager.server);
  this.messagesService.sendInvite(userDto, client, this.lobbyManager.server);
}

@SubscribeMessage('markOnline')
async markOnline(@MessageBody('user') userDto: SendUserDto,@ConnectedSocket() client: Socket,) {
  this.messagesService.markOnline(userDto, this.lobbyManager.server);
}






///////////////////////////////////////////////////////////////////


  async handleConnection(client: Socket, ...args: any[]): Promise<void> {

    this.lobbyManager.initializeSocket(client as AuthenticatedSocket);

  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.messagesService.markDisconnected(client.id, this.lobbyManager.server);
    this.logger.log('Client disconnected: ', client.id);
    const temp = client.id;
    for (const lobby of this.lobbyManager.lobbies.values()) {
      if (lobby.clients.has(temp)) {
        const clientData = lobby.clients.get(temp);
        if (clientData.data.position === 'right') {
          lobby.updateGameStats({playerLeft: 10, playerRight: lobby.instance.game.score.playerRight}, 'left', lobby.games);
          await this.lobbyManager.cleanUpBackButton(temp);
          this.lobbyManager.terminateSocket(client);
          this.lobbyManager.server.to(lobby.id).emit('returnToStart');
        } else if (clientData.data.position === 'left') {
          lobby.updateGameStats({playerLeft: lobby.instance.game.score.playerRight, playerRight: 10}, 'right', lobby.games);
          await this.lobbyManager.cleanUpBackButton(temp);
          this.lobbyManager.terminateSocket(client);
          this.lobbyManager.server.to(lobby.id).emit('returnToStart');
        }
        break;
      }
    }

  }
  
  @SubscribeMessage('backButton')
  async button(@ConnectedSocket() player: Socket){
    
    for (const [lobbyId, lobby] of this.lobbyManager.lobbies) {
      for (const [key, client] of lobby.clients.entries()) {
        if (client.id === player.id) {
          this.lobbyManager.server.to(lobby.id).emit('returnToStart');
          await this.lobbyManager.cleanUpBackButton(player.id);
          return ;
        }
      }
    }
  }

  @SubscribeMessage('abort')
  async abort(@ConnectedSocket() client: Socket) {
    this.lobbyManager.cleanUp(client.id);
  }

  @SubscribeMessage('privateLobby')
  async privateEntry(@ConnectedSocket() client: Socket, @MessageBody() user: any){
    if(user.first == true) {
      user.first = false;
      this.lobby_id = await this.lobbyManager.privateLobby(client, user.modus, user.name, user.id_42, true, '');
      this.lobbyManager.server.to(user.friend_socket_id).emit('establishConnection', user);
    } else if(user.first == false) {
      this.lobbyManager.privateLobby(client, user.modus, user.friend_name, user.friend_id_42, false, this.lobby_id);
    }
  }

  @SubscribeMessage('requestLobby')
  entry(@ConnectedSocket() client: Socket, @MessageBody() user: any){
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
      }
    } 
  }
}
