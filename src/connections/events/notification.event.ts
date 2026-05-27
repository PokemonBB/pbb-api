export interface NotificationEventPayload {
  id: string;
  message: string;
  type: string;
  action?: string;
  createdAt: Date;
}
