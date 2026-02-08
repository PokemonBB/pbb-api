# Socket.io – Implementation

How Socket.io is implemented in the API: connection handling, authentication, rooms, events, and code structure. For the high-level role of Socket.io (Main / Lobby) in the architecture, see [Real-Time Connections](/docs/connections).

---

## 1. Overview

Socket.io runs on the **same HTTP server and port** as the REST API (Fastify). Clients connect to the same host and port; the WebSocket upgrade is handled by the Socket.io adapter. The API uses one Socket.io server instance and one gateway; user-specific events are sent by joining each authenticated client to a **user room** and emitting to that room.

---

## 2. Architecture

| Component | Role |
| :--- | :--- |
| **ConnectionsGateway** | Nest WebSocket gateway. Handles `connection` / `disconnect`, reads JWT from the handshake, and joins the client to the room `user:{userId}`. Registers the Socket.io `Server` with `SocketEmitterService` in `afterInit`. |
| **SocketEmitterService** | Holds a reference to the Socket.io `Server` and exposes `emitToUser(userId, event, data)`. Used by other services (e.g. Notifications) to send events to a user without depending on the gateway. |
| **Events** | Event names and payload types live under `src/connections/events/`. Services import the name constant and the payload type, then call `socketEmitter.emitToUser(userId, eventName, payload)`. |

---

## 3. Client Connection

- **URL:** Same as the API base URL (e.g. ({API_BASE_URL})[{API_BASE_URL}]) or the deployed host and port). Socket.io attaches to the same HTTP server.
- **Authentication:** The client must send the same session cookie as the REST API. The cookie name is `token` and contains the JWT. The browser typically sends it automatically when connecting to the same origin.

If the client does not send a valid `token` cookie, the connection is still accepted but the socket is **not** joined to any user room, so it will not receive user-scoped events (e.g. notifications).

---

## 4. Authentication and User Rooms

1. On **connection**, the gateway reads `handshake.headers.cookie`.
2. A helper (`getTokenFromHandshake`) parses the cookie string and returns the value of `token`.
3. The gateway verifies the JWT with the same secret as the REST API (`JwtService`) and reads `sub` (user id).
4. If valid, the socket joins the room `user:{userId}` (see `USER_ROOM_PREFIX` in `socket-emitter.service.ts`).

Only one room per user is used for all user-scoped events. Multiple tabs or devices for the same user will all be in the same room and receive the same events.

---

## 5. Events

### 5.1 Event: `notification`

- **Name:** `'notification'` (constant: `NOTIFICATION` in `src/connections/events/event-names.ts`).
- **Direction:** Server → Client.
- **When:** Emitted when a new in-app notification is created for a user (see [Notifications](/docs/notifications)). Fired from `NotificationsService` after `createNotificationForUser` or for each user in `createNotificationForAllUsers`.
- **Payload:** `NotificationEventPayload`:
  - `id`: string (notification document id)
  - `message`: string
  - `type`: string (`'notification' | 'info' | 'warning' | 'error' | 'success'`)
  - `createdAt`: Date

The frontend can listen for this event to show toasts, update the notification list, or refresh unread state without polling.

---

## 6. Code Structure

```
src/connections/
├── connections.gateway.ts      # WebSocket gateway: connection, disconnect, JWT + join room
├── connections.module.ts      # Module: gateway, SocketEmitterService, JwtModule; exports SocketEmitterService
├── socket-emitter.service.ts  # Holds Server, emitToUser(userId, event, data)
├── helpers/
│   └── handshake-auth.helper.ts  # getTokenFromHandshake(cookieHeader)
└── events/
    ├── index.ts                # Re-exports event names and payload types
    ├── event-names.ts          # NOTIFICATION, etc.
    └── notification.event.ts  # NotificationEventPayload interface
```

- **Adding a new event:** Add the name in `event-names.ts`, define the payload type (e.g. in a new `*.event.ts`), export from `events/index.ts`. In the service that triggers the event, inject `SocketEmitterService` and call `emitToUser(userId, EVENT_NAME, payload)`.
- **Emitting from another module:** That module must import `ConnectionsModule` (which exports `SocketEmitterService`) and inject `SocketEmitterService`.

---

## 7. Integration Example: Notifications

- **NotificationsModule** imports **ConnectionsModule** and injects `SocketEmitterService` into `NotificationsService`.
- After creating a notification (single user or all users), `NotificationsService` calls a private `emitNotificationEvent(receiverId, notification)` which builds `NotificationEventPayload` and calls `socketEmitter.emitToUser(receiverId, NOTIFICATION, payload)`.

No polling is required: any client that is connected and in the `user:{userId}` room receives the `notification` event as soon as the notification is created.
