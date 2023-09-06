export enum ClientEvents
{
  Ping = 'client.ping',
}

export enum ServerEvents
{
  Pong = 'server.pong',
  GameMessage = 'lobby.created',
}


export type ServerPayloads = {
  [ServerEvents.Pong]: {
    message: string;
  };

  [ServerEvents.GameMessage]: {
    message: string;
  };
};