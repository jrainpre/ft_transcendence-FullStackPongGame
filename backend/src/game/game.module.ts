import { Module } from '@nestjs/common';
import { GameController } from './controllers/game/game.controller';
import { GameService } from './services/game/game.service';
import { GameGateway } from './gateways/game/game.gateway';
// import { LobbyManager } from './lobby/lobby.manager';
import { LobbyService } from './services/lobby/lobby.service';
import { Lobby } from './services/lobby/lobby';

@Module({
  controllers: [GameController],
  providers: [GameService, GameGateway, LobbyService  ],
})
export class GameModule {}
