import { Socket } from 'socket.io';
import { Lobby } from './lobby';
import { ServerEvents } from '../../types';
import { User } from 'src/entities/user.entity';

export type AuthenticatedSocket = Socket & {
  data: {
    lobby: null | Lobby;
    position: string;
    modus: string;
    name: string;
    id: string;
  };

  emit: <T>(ev: ServerEvents, data: T) => boolean;
};