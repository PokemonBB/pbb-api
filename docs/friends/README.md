# Friends

The friends system lets users send, accept or decline friend requests and maintain a list of accepted friends. All endpoints require an [authenticated](/docs/auth) and [active](/docs/users/ACTIVATION) session. Lists use the same [pagination](/docs/common/PAGINATION) as the rest of the API.

## Model

A **friendship** is a single document linking two users with a status:

- **requester**: User who sent the request
- **receiver**: User who receives the request
- **status**: `pending` | `accepted` | `declined`
- **respondedAt**: Set when the receiver accepts or declines (optional)

The pair (requester, receiver) is unique: there is at most one friendship per ordered pair. The same two users cannot have two pending or accepted relationships in either direction.

## Flow

**Send request:** User A sends a friend request to user B. The receiver must exist (and, for USER role, only [active](/docs/users/ACTIVATION) users are visible when searching). You cannot send a request to yourself. If there is already a pending request between A and B (in either direction), or they are already friends, the API returns an error. On success, a [notification](/docs/notifications) is created for the receiver (“You have a new friend request”).

**Accept / Decline:** Only the **receiver** can accept or decline. The request must be in `pending` status. Accept sets status to `accepted` and `respondedAt`; decline sets status to `declined` and `respondedAt`. After that, the request is no longer pending.

**Friends list:** Returns only friendships with status `accepted` where the current user is either requester or receiver. The response is the list of the “other” user in each friendship (the actual friends). Pagination applies. The fields returned for each friend depend on the viewer’s [role and visibility](/docs/users/VISIBILITY) (e.g. USER sees limited fields, ADMIN/ROOT see more).

**Pending requests:** Incoming requests: friendships where the current user is **receiver** and status is `pending`. Paginated.

**Sent requests:** Outgoing requests: friendships where the current user is **requester** and status is `pending`. Paginated.

**Remove friend:** Either friend can remove the relationship. The API looks up the accepted friendship (in either direction) and deletes it. No notification is sent.

## Restrictions

- No self-requests (requester ≠ receiver).
- No duplicate link: if there is any existing friendship (pending, accepted or declined) between the same two users, a new request in either direction is rejected (already exists or already friends).
- Accept/decline only by the receiver and only when status is `pending`.

## Notifications

When a friend request is sent, the receiver gets an in-app [notification](/docs/notifications) (“You have a new friend request”). Accept and decline do not create notifications.

## API Reference

For request and response schemas, parameters and examples, see [Swagger - Friends]({API_BASE_URL}/api#/Friends).
