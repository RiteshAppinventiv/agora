declare namespace NotificationRequest {

	export interface Id {
		notificationId?: string;
	}

	export interface Add {
		eventId?: string;
		senderId: string;
		receiverId: string[];
		title: string;
		message: string;
		body: string;
		type: string;
	}
}