import { Socket } from 'socket.io';
import { Lobby } from './lobby';
import { ServerEvents } from '../../types';

export type AuthenticatedSocket = Socket & {
  data: {
    lobby: null | Lobby;
    position: string;
    modus: string;
  };

  emit: <T>(ev: ServerEvents, data: T) => boolean;
};