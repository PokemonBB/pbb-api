# Friends System

## Overview

The friends system allows users to send friend requests, accept/decline them, and manage their friend relationships. It includes pagination for all list endpoints and comprehensive security validations.

## How It Works

### 🔄 **Friend Request Flow**

1. **User sends request** → `POST /api/friends/request/:receiverId`
2. **System validates** → No duplicates, not self-request
3. **Request created** → Status: `pending`
4. **Receiver accepts/declines** → `PATCH /api/friends/accept/:requestId` or `PATCH /api/friends/decline/:requestId`
5. **Status updated** → `accepted` or `declined`
6. **Friends can interact** → Listed in friends list

### 📊 **Database Schema**

```typescript
@Schema({ timestamps: true })
export class Friendship {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requester: Types.ObjectId; // User who sent the request

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiver: Types.ObjectId; // User who receives the request

  @Prop({
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Date, default: null })
  respondedAt?: Date; // When the request was responded to
}
```

### 🔍 **Database Indexes**

```typescript
// Unique constraint to prevent duplicates
FriendshipSchema.index({ requester: 1, receiver: 1 }, { unique: true });

// Performance indexes
FriendshipSchema.index({ status: 1 });
FriendshipSchema.index({ requester: 1, status: 1 });
FriendshipSchema.index({ receiver: 1, status: 1 });
```

## API Endpoints

### 👥 **Send Friend Request**

```http
POST /api/friends/request/:receiverId
Authorization: Cookie with JWT token
```

**Parameters:**

- `receiverId`: ID of the user to send friend request to

**Response:**

```json
{
  "message": "Friend request sent successfully",
  "friendship": {
    "id": "507f1f77bcf86cd799439011",
    "requester": "507f1f77bcf86cd799439012",
    "receiver": "507f1f77bcf86cd799439013",
    "status": "pending",
    "createdAt": "2024-01-24T14:30:00.000Z"
  }
}
```

### ✅ **Accept Friend Request**

```http
PATCH /api/friends/accept/:requestId
Authorization: Cookie with JWT token
```

**Parameters:**

- `requestId`: ID of the friend request to accept

**Response:**

```json
{
  "message": "Friend request accepted successfully",
  "friendship": {
    "id": "507f1f77bcf86cd799439011",
    "requester": "507f1f77bcf86cd799439012",
    "receiver": "507f1f77bcf86cd799439013",
    "status": "accepted",
    "respondedAt": "2024-01-24T15:30:00.000Z"
  }
}
```

### ❌ **Decline Friend Request**

```http
PATCH /api/friends/decline/:requestId
Authorization: Cookie with JWT token
```

**Parameters:**

- `requestId`: ID of the friend request to decline

**Response:**

```json
{
  "message": "Friend request declined successfully",
  "friendship": {
    "id": "507f1f77bcf86cd799439011",
    "requester": "507f1f77bcf86cd799439012",
    "receiver": "507f1f77bcf86cd799439013",
    "status": "declined",
    "respondedAt": "2024-01-24T15:30:00.000Z"
  }
}
```

### 📋 **Get Friends List (Paginated)**

```http
GET /api/friends?page=1&limit=10
Authorization: Cookie with JWT token
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "USER",
      "active": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 📥 **Get Pending Requests (Paginated)**

```http
GET /api/friends/requests?page=1&limit=10
Authorization: Cookie with JWT token
```

**Response:**

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "requester": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "johndoe",
        "email": "john@example.com",
        "role": "USER",
        "active": true
      },
      "receiver": "507f1f77bcf86cd799439013",
      "status": "pending",
      "createdAt": "2024-01-24T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 📤 **Get Sent Requests (Paginated)**

```http
GET /api/friends/sent?page=1&limit=10
Authorization: Cookie with JWT token
```

**Response:**

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "requester": "507f1f77bcf86cd799439012",
      "receiver": {
        "_id": "507f1f77bcf86cd799439013",
        "username": "janedoe",
        "email": "jane@example.com",
        "role": "USER",
        "active": true
      },
      "status": "pending",
      "createdAt": "2024-01-24T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 🗑️ **Remove Friend**

```http
DELETE /api/friends/:friendId
Authorization: Cookie with JWT token
```

**Parameters:**

- `friendId`: ID of the friend to remove

**Response:**

```json
{
  "message": "Friend removed successfully"
}
```

## Security Features

### 🔒 **Validation Rules**

#### **Send Friend Request**

- ✅ **Self-request prevention**: Cannot send request to yourself
- ✅ **User existence**: Receiver must exist
- ✅ **Duplicate prevention**: No existing request between users
- ✅ **Status validation**: Cannot send if already friends

#### **Accept/Decline Request**

- ✅ **Ownership validation**: Only receiver can accept/decline
- ✅ **Status validation**: Only pending requests can be responded to
- ✅ **Request existence**: Request must exist

#### **Remove Friend**

- ✅ **Friendship validation**: Must be accepted friendship
- ✅ **Ownership validation**: User must be part of the friendship

### 🛡️ **Error Handling**

#### **Common Errors**

**Cannot send to yourself:**

```json
{
  "statusCode": 400,
  "message": "Cannot send friend request to yourself",
  "error": "Bad Request"
}
```

**User not found:**

```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

**Request already exists:**

```json
{
  "statusCode": 409,
  "message": "Friend request already exists",
  "error": "Conflict"
}
```

**Already friends:**

```json
{
  "statusCode": 409,
  "message": "Users are already friends",
  "error": "Conflict"
}
```

**Cannot accept others' requests:**

```json
{
  "statusCode": 403,
  "message": "You can only accept requests sent to you",
  "error": "Forbidden"
}
```

## Frontend Integration

### 📱 **React Component Example**

```jsx
import React, { useState, useEffect } from 'react';

function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadFriends(currentPage);
  }, [currentPage]);

  const loadFriends = async (page) => {
    try {
      const response = await fetch(`/api/friends?page=${page}&limit=10`);
      const data = await response.json();
      setFriends(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      const response = await fetch(`/api/friends/request/${userId}`, {
        method: 'POST',
      });
      const result = await response.json();
      if (response.ok) {
        alert('Friend request sent!');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/friends/accept/${requestId}`, {
        method: 'PATCH',
      });
      const result = await response.json();
      if (response.ok) {
        alert('Friend request accepted!');
        loadFriends(currentPage);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  return (
    <div>
      <h2>Friends ({pagination.total})</h2>

      <div className="friends-list">
        {friends.map((friend) => (
          <div key={friend._id} className="friend-item">
            <h3>{friend.username}</h3>
            <p>Role: {friend.role}</p>
            <p>Active: {friend.active ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={!pagination.hasPrev}
        >
          First
        </button>

        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={!pagination.hasPrev}
        >
          Previous
        </button>

        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={!pagination.hasNext}
        >
          Next
        </button>

        <button
          onClick={() => setCurrentPage(pagination.totalPages)}
          disabled={!pagination.hasNext}
        >
          Last
        </button>
      </div>
    </div>
  );
}
```

### 🎨 **Friend Request Component**

```jsx
function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({});

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/friends/requests?page=1&limit=10');
      const data = await response.json();
      setRequests(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const response = await fetch(`/api/friends/accept/${requestId}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        loadRequests(); // Reload requests
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      const response = await fetch(`/api/friends/decline/${requestId}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        loadRequests(); // Reload requests
      }
    } catch (error) {
      console.error('Failed to decline request:', error);
    }
  };

  return (
    <div>
      <h2>Friend Requests ({pagination.total})</h2>

      {requests.map((request) => (
        <div key={request._id} className="request-item">
          <h3>{request.requester.username}</h3>
          <p>Sent: {new Date(request.createdAt).toLocaleDateString()}</p>

          <div className="request-actions">
            <button onClick={() => handleAccept(request._id)}>Accept</button>
            <button onClick={() => handleDecline(request._id)}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Performance Considerations

### ⚡ **Database Optimization**

#### **Efficient Queries**

```typescript
// Get friends with pagination
const friendships = await this.friendshipModel
  .find({
    status: 'accepted',
    $or: [{ requester: userId }, { receiver: userId }],
  })
  .populate('requester', 'username email role active')
  .populate('receiver', 'username email role active')
  .skip(skip)
  .limit(limit)
  .exec();
```

#### **Index Usage**

- ✅ **Unique constraint**: Prevents duplicate requests
- ✅ **Status index**: Fast filtering by status
- ✅ **User indexes**: Fast lookups by requester/receiver
- ✅ **Compound indexes**: Optimized for common queries

### 📊 **Pagination Benefits**

#### **Memory Efficiency**

- ✅ **Limited results**: Only loads needed data
- ✅ **Scalable**: Works with millions of friendships
- ✅ **Fast queries**: Indexed lookups

#### **User Experience**

- ✅ **Quick loading**: Fast page loads
- ✅ **Navigation**: Easy browsing
- ✅ **Responsive**: Works on all devices

## Monitoring & Analytics

### 📈 **Metrics to Track**

- **Friend request rate**: How many requests per day
- **Acceptance rate**: % of requests accepted
- **Active friendships**: Number of active friend relationships
- **Popular users**: Most requested users
- **Response time**: How quickly requests are responded to

### 🔍 **Debugging**

#### **Check Friendship Status**

```javascript
// Check if two users are friends
db.friendships.findOne({
  status: 'accepted',
  $or: [
    { requester: ObjectId('user1'), receiver: ObjectId('user2') },
    { requester: ObjectId('user2'), receiver: ObjectId('user1') },
  ],
});
```

#### **Check Pending Requests**

```javascript
// Check pending requests for a user
db.friendships.find({
  receiver: ObjectId('userId'),
  status: 'pending',
});
```

## Future Enhancements

### 🚀 **Potential Features**

- **Friend suggestions**: Recommend friends based on mutual connections
- **Friend groups**: Organize friends into groups
- **Friend activity**: Show friend activity feeds
- **Block users**: Prevent friend requests from specific users
- **Friend limits**: Limit number of friends per user
- **Friend verification**: Verify friend relationships
- **Friend search**: Search within friends list
- **Friend notifications**: Real-time friend request notifications

¡El sistema de amigos está completamente implementado! 🎉
