import { Module } from '@nestjs/common';
import { GameController } from './controllers/game/game.controller';
import { GameGateway } from './gateways/game/game.gateway';
import { LobbyService } from './services/lobby/lobby.service';
import { Lobby } from './services/lobby/lobby';
// import { LobbyManager } from './lobby/lobby.manager';
// import { GameService } from './services/game/game.service';

@Module({
  controllers: [GameController],
  providers: [GameGateway, LobbyService],
})
export class GameModule {}
