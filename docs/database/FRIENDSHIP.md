# Friendship

**Collection:** `friendships`  
**TTL:** None. Documents are not automatically deleted.

## Indexes

- Unique compound index on `(requester, receiver)` to prevent duplicate pairs.
- Indexes on `status`, `(requester, status)`, `(receiver, status)` for list queries.

See [Friends](/docs/friends) for the flow (send request, accept/decline, remove).

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| requester | ObjectId | Yes | Ref: User. User who sent the friend request. |
| receiver | ObjectId | Yes | Ref: User. User who receives the request. |
| status | string | Yes | Enum: 'pending', 'accepted', 'declined'. Default: 'pending'. |
| respondedAt | Date | No | Set when receiver accepts or declines. Default: null. |
| createdAt | Date | Auto | Mongoose timestamps. |
| updatedAt | Date | Auto | Mongoose timestamps. |

Validation (in schema): `requester` and `receiver` cannot be equal (no self-request).
