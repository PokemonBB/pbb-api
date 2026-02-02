# Notification

**Collection:** `notifications`  
**TTL:** None. Documents are not automatically deleted. Users can delete their own via the API.

## Indexes

- Compound index on `(receiver, createdAt)` (createdAt descending) for paginated list by user.
- Index on `receiver` for queries by recipient.

See [Notifications](/docs/notifications) for who creates them and how they are used.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | Notification text. |
| type | string | Yes | Enum: 'notification', 'info', 'warning', 'error', 'success'. Default: 'notification'. Used for display (e.g. styling). |
| receiver | ObjectId | Yes | Ref: User. Recipient of the notification. |
| createdAt | Date | Auto | Mongoose timestamps. |
| updatedAt | Date | Auto | Mongoose timestamps. |
