# Pagination System

## Overview

The pagination system provides efficient data retrieval for large datasets by dividing results into manageable pages. This system is implemented for user listings and search results.

## How It Works

### 🔄 **Pagination Flow**

1. **Client requests data** → `GET /api/users?page=1&limit=10`
2. **Server calculates offset** → `skip = (page - 1) * limit`
3. **Database query with limits** → `find().skip(skip).limit(limit)`
4. **Count total records** → `countDocuments()`
5. **Return paginated response** → Data + pagination metadata

### 📊 **Pagination Parameters**

```typescript
interface PaginationDto {
  page?: number; // Page number (default: 1)
  limit?: number; // Items per page (default: 10, max: 100)
}
```

## API Endpoints

### 👥 **Get All Users (Paginated)**

```http
GET /api/users?page=1&limit=10
Authorization: Cookie with JWT token
```

**Response:**

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "USER",
      "active": true,
      "createdAt": "2024-01-24T14:30:00.000Z",
      "updatedAt": "2024-01-24T14:30:00.000Z"
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

### 🔍 **Search Users (Paginated)**

```http
GET /api/users/search?query=john&page=1&limit=5
Authorization: Cookie with JWT token
```

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
    "limit": 5,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## Pagination Metadata

### 📋 **Response Structure**

```typescript
interface PaginatedResponse<T> {
  data: T[]; // Array of items
  pagination: {
    page: number; // Current page
    limit: number; // Items per page
    total: number; // Total items
    totalPages: number; // Total pages
    hasNext: boolean; // Has next page
    hasPrev: boolean; // Has previous page
  };
}
```

### 🔢 **Pagination Logic**

```typescript
const skip = (page - 1) * limit;
const totalPages = Math.ceil(total / limit);
const hasNext = page < totalPages;
const hasPrev = page > 1;
```

## Usage Examples

### 📱 **Frontend Integration**

#### **Basic Pagination**

```javascript
async function getUsers(page = 1, limit = 10) {
  const response = await fetch(`/api/users?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await response.json();
  return result;
}

// Usage
const users = await getUsers(1, 10);
console.log(`Page ${users.pagination.page} of ${users.pagination.totalPages}`);
```

#### **Search with Pagination**

```javascript
async function searchUsers(query, page = 1, limit = 10) {
  const response = await fetch(
    `/api/users/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  const result = await response.json();
  return result;
}

// Usage
const results = await searchUsers('john', 1, 5);
console.log(`Found ${results.pagination.total} users matching "john"`);
```

#### **Pagination Controls**

```html
<div class="pagination">
  <button onclick="loadPage(1)" disabled="${!pagination.hasPrev}">First</button>

  <button onclick="loadPage(currentPage - 1)" disabled="${!pagination.hasPrev}">
    Previous
  </button>

  <span>Page ${pagination.page} of ${pagination.totalPages}</span>

  <button onclick="loadPage(currentPage + 1)" disabled="${!pagination.hasNext}">
    Next
  </button>

  <button
    onclick="loadPage(pagination.totalPages)"
    disabled="${!pagination.hasNext}"
  >
    Last
  </button>
</div>
```

### 🎨 **React Component Example**

```jsx
import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    loadUsers(currentPage);
  }, [currentPage]);

  const loadUsers = async (page) => {
    try {
      const response = await fetch(`/api/users?page=${page}&limit=${limit}`);
      const data = await response.json();
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  return (
    <div>
      <h2>Users ({pagination.total})</h2>

      <div className="user-list">
        {users.map((user) => (
          <div key={user._id} className="user-item">
            <h3>{user.username}</h3>
            <p>Role: {user.role}</p>
            <p>Active: {user.active ? 'Yes' : 'No'}</p>
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

## Performance Considerations

### ⚡ **Database Optimization**

#### **Indexes for Pagination**

```javascript
// Ensure proper indexes for efficient pagination
db.users.createIndex({ username: 1 });
db.users.createIndex({ email: 1 });
db.users.createIndex({ createdAt: -1 });
```

#### **Query Optimization**

```typescript
// Efficient pagination query
const [data, total] = await Promise.all([
  this.userModel
    .find(filter)
    .select(fields)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 }) // Consistent ordering
    .exec(),
  this.userModel.countDocuments(filter),
]);
```

### 📊 **Memory Management**

#### **Limit Constraints**

- **Default limit**: 10 items per page
- **Maximum limit**: 100 items per page
- **Prevents**: Memory issues with large datasets

#### **Efficient Counting**

```typescript
// Use countDocuments for accurate totals
const total = await this.userModel.countDocuments(filter);

// Avoid count() on large collections
// const total = await this.userModel.find(filter).count(); // ❌ Slow
```

## Error Handling

### ❌ **Common Errors**

#### **Invalid Page Number**

```json
{
  "statusCode": 400,
  "message": "Page must be a positive number",
  "error": "Bad Request"
}
```

#### **Invalid Limit**

```json
{
  "statusCode": 400,
  "message": "Limit must be between 1 and 100",
  "error": "Bad Request"
}
```

### 🔧 **Validation Rules**

```typescript
@IsOptional()
@Transform(({ value }) => parseInt(value))
@IsNumber()
@Min(1)
page?: number = 1;

@IsOptional()
@Transform(({ value }) => parseInt(value))
@IsNumber()
@Min(1)
@Max(100)
limit?: number = 10;
```

## Best Practices

### 🎯 **User Experience**

#### **Sensible Defaults**

- **Page 1**: Start with first page
- **Limit 10**: Reasonable page size
- **Max 100**: Prevent performance issues

#### **Clear Navigation**

- **Previous/Next**: Easy navigation
- **Page numbers**: Show current position
- **Total count**: Show total items
- **Loading states**: Indicate when loading

### 🔒 **Security**

#### **Input Validation**

```typescript
// Validate pagination parameters
@Min(1) page?: number;
@Min(1) @Max(100) limit?: number;
```

#### **Rate Limiting**

```typescript
// Prevent abuse with rate limiting
@UseGuards(ThrottlerGuard)
@Throttle(100, 60) // 100 requests per minute
```

### 📈 **Performance**

#### **Database Indexes**

```javascript
// Create indexes for efficient queries
db.users.createIndex({ username: 1 });
db.users.createIndex({ email: 1 });
db.users.createIndex({ createdAt: -1 });
```

#### **Caching Strategy**

```typescript
// Cache pagination results
@CacheKey('users')
@CacheTTL(300) // 5 minutes
async findAllPaginated(paginationDto: PaginationDto) {
  // Implementation
}
```

## Implementation Details

### 🏗️ **Service Methods**

```typescript
// Paginated user listing
async findAllPaginated(paginationDto: PaginationDto): Promise<PaginatedResponse<User>> {
  const { page = 1, limit = 10 } = paginationDto;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.userModel
      .find(USER_FILTERS.ALL_USERS)
      .select(USER_FIELD_SELECTORS.ADMIN)
      .skip(skip)
      .limit(limit)
      .exec(),
    this.userModel.countDocuments(USER_FILTERS.ALL_USERS),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
```

### 🎛️ **Controller Integration**

```typescript
@Get()
@ApiOperation({
  summary: 'Get all users with pagination',
  description: 'Retrieve paginated list of users. Use query parameters: ?page=1&limit=10'
})
findAll(@Query() paginationDto: PaginationDto) {
  return this.usersService.findAllPaginated(paginationDto);
}
```

## Monitoring & Analytics

### 📊 **Metrics to Track**

- **Page load times**: Monitor pagination performance
- **Popular page sizes**: Most used limit values
- **Navigation patterns**: How users browse pages
- **Search pagination**: Search result pagination usage

### 🔍 **Debugging**

#### **Query Performance**

```javascript
// Check query execution time
db.users.find({}).skip(0).limit(10).explain('executionStats');
```

#### **Index Usage**

```javascript
// Verify indexes are being used
db.users.find({ username: /john/ }).explain('executionStats');
```

## Future Enhancements

### 🚀 **Potential Improvements**

- **Cursor-based pagination**: For real-time data
- **Infinite scroll**: Load more on scroll
- **Smart pagination**: Adaptive page sizes
- **Caching layers**: Redis for pagination cache
- **Search highlighting**: Highlight search terms
- **Sorting options**: Sort by different fields
- **Filtering**: Advanced filtering options

¡El sistema de paginación está completamente implementado! 🎉
