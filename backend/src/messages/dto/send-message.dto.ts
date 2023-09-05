export class SendMessageDto {
	author: string;
	content: string;
	owner_id: number;
	channel_id: number;
	isSystemMessage: boolean;
	created_at: Date;
}