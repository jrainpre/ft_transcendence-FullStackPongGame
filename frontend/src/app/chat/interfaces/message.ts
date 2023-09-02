export interface User {
	name: string;
	id_42: number;
  }

export interface Message {
	content: string;
	author: string;
	owner_id: number;
	channel_id: number;
	isSystemMessage: boolean;
	created_at: Date;
}

export interface Channel {
	id: number;
	name: string;
	private_channel: boolean;
}
