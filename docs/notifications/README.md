# Notifications

In-app messages stored in the database. Each notification has a **receiver** (one user), a **message** and a **type** used for display (e.g. styling or icons). Users can list their own notifications (paginated) and delete them. Creation is either automatic (triggered by other flows) or manual by [ADMIN/ROOT](/docs/users/ROLES).

All notification endpoints require an [authenticated](/docs/auth) and [active](/docs/users/ACTIVATION) session. Lists use the same [pagination](/docs/common/PAGINATION) as the rest of the API.

## Model

- **message**: Text content
- **type**: `notification` | `info` | `warning` | `error` | `success` (default: `notification`)
- **receiver**: User who receives the notification (reference to User)

Documents are stored in the **notifications** collection with timestamps. List queries are sorted by creation date (newest first).

## Who Creates Notifications

**Automatically:** The [friends](/docs/friends) system creates a notification when a user sends a friend request: the receiver gets one notification with message “You have a new friend request” and type `notification`.

**Manually (ADMIN/ROOT only):** A [ROOT or ADMIN](/docs/users/ROLES) user can call the create-notification endpoint to send a message to a single user (by `receiverId`) or to all users (`sendToAll: true`). When sending to all, the API creates one notification document per user. Use cases: announcements, maintenance notices, or targeted messages (e.g. “Your friend request was accepted”).

## Scope

Every notification has exactly one receiver. There is no “broadcast” document: “send to all” means one notification per user. Each user only sees and can delete their own notifications.

## List and Delete

**List:** `GET /api/notifications` returns the current user’s notifications, paginated and ordered by newest first. Only the owner can see them.

**Delete:** `DELETE /api/notifications/:notificationId` removes a single notification. Allowed only if the authenticated user is the receiver; otherwise the API returns 403.

## API Reference

For request/response schemas, query parameters and examples, see [Swagger - Notifications]({API_BASE_URL}/api#/Notifications).
