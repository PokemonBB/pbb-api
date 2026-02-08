# Real-Time Connections Architecture

The application has 3 main types of real-time connections:  
- Main connection  
- Lobby connection  
- Game connection  

There are 2 main tools for handling these connections:  
- Socket.io
- Geckos.io

---

## 1. Connection Strategy Overview

Depending on the type and the specific requirements of the connection, one tool or the other will be used:

| Connection Type | Technology | Protocol | Priority |
| :--- | :--- | :--- | :--- |
| **Main** | Socket.io | WebSockets (TCP) | Reliability & Status |
| **Lobby** | Socket.io | WebSockets (TCP) | Reliable Event Delivery |
| **Game** | Geckos.io | WebRTC (UDP) | Ultra-Low Latency |

---

## 2. Detailed Connection Roles

### Main Connection (Socket.io)
The "Heartbeat" of the application. It manages the global state of the user’s session.
* **Purpose:** Monitors server status and latency.
* **Functionality:** Handles global real-time notifications. If this connection is lost, the web app restricts access to the game interface to prevent de-sync.

### Lobby Connection (Socket.io)
Used when a user enters social hubs or matchmaking areas.
* **Logic:** Operates via **Rooms**. Each lobby is a specific room where users interact only with others in that same space.
* **Reliability:** Uses TCP to ensure critical events (like match invitations) are never lost.
* **Note:** The Main and Lobby connections are technically the same instance. The difference lies in the events handled (e.g., Lobbies handle positioning, while Main handles global notifications).

### Game Connection (Geckos.io)
The high-performance connection used during active matches.
* **Server-Authoritative:** The server validates all actions (movement, attacks, damage). The client sends an "intent," and the server broadcasts the validated result.
* **Packet Loss Management:** Uses UDP to prioritize current data. If lag occurs, the game skips to the most recent state rather than "teleporting" characters backward to catch up on old data.
* **Security:** Provides a secure environment to prevent client-side cheating.

---

## 3. Technical Comparison: Socket.io vs. Geckos.io

### Socket.io (TCP)
* **Guaranteed Delivery:** Data arrives in the correct order without loss.
* **Connectivity:** Works on almost any network/firewall.
* **Efficiency:** Low CPU overhead.
* **Use Case:** "Accept Duel" requests. If this packet is lost, the game cannot start.

### Geckos.io (UDP/SCTP)
* **Ultra-Low Latency:** Optimized for real-time reactions.
* **Modern Logic:** In a MOBA setting, it avoids "rubber-banding" by jumping to the latest server state.
* **Resource Usage:** Slightly higher CPU usage due to WebRTC encryption.

---

## 4. Known Issues & Infrastructure Solutions

**Issue:** Geckos.io (WebRTC) may be blocked by certain corporate or restrictive firewalls.

**Solution:** **TURN Server Integration.**
We implement a TURN server to act as a bridge/relay. If a direct UDP connection fails, the traffic is routed through the TURN server, ensuring 100% player connectivity regardless of their network restrictions.

---

## 5. Implementation and Events

| Link | Content |
| :--- | :--- |
| [Socket.io – Implementation](/docs/connections/SOCKET_IO) | Connection, auth (JWT/cookie), user rooms, event `notification`, code structure, and how to add events. |
| Geckos.io (Game) | To be documented when the game connection is implemented. |
