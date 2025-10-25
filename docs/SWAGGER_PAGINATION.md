# Swagger Documentation - Pagination Parameters

## Overview

The Swagger documentation now includes detailed query parameters for pagination endpoints, making it easy for developers to understand and test the API.

## Updated Endpoints

### 👥 **GET /api/users**

#### **Query Parameters in Swagger**

- **page** (optional): Page number (default: 1)
- **limit** (optional): Items per page (default: 10, max: 100)

#### **Swagger UI Display**

```
GET /api/users
Query Parameters:
┌─────────┬──────────┬─────────┬─────────────────────────────────┬─────────┐
│ Name    │ Required │ Type    │ Description                     │ Example │
├─────────┼──────────┼─────────┼─────────────────────────────────┼─────────┤
│ page    │ No       │ Number  │ Page number (default: 1)        │ 1       │
│ limit   │ No       │ Number  │ Items per page (default: 10)   │ 10      │
└─────────┴──────────┴─────────┴─────────────────────────────────┴─────────┘
```

#### **Example Request**

```http
GET /api/users?page=2&limit=5
Authorization: Cookie with JWT token
```

#### **Example Response**

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
    "page": 2,
    "limit": 5,
    "total": 25,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### 🔍 **GET /api/users/search**

#### **Query Parameters in Swagger**

- **query** (required): Search term (username)
- **page** (optional): Page number (default: 1)
- **limit** (optional): Items per page (default: 10, max: 100)

#### **Swagger UI Display**

```
GET /api/users/search
Query Parameters:
┌─────────┬──────────┬─────────┬─────────────────────────────────┬─────────┐
│ Name    │ Required │ Type    │ Description                     │ Example │
├─────────┼──────────┼─────────┼─────────────────────────────────┼─────────┤
│ query   │ Yes      │ String  │ Search term (username)          │ john    │
│ page    │ No       │ Number  │ Page number (default: 1)        │ 1       │
│ limit  │ No       │ Number  │ Items per page (default: 10)   │ 10      │
└─────────┴──────────┴─────────┴─────────────────────────────────┴─────────┘
```

#### **Example Request**

```http
GET /api/users/search?query=john&page=1&limit=5
Authorization: Cookie with JWT token
```

#### **Example Response**

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

## Swagger UI Features

### 🎯 **Interactive Testing**

#### **Try It Out Button**

- Click "Try it out" in Swagger UI
- Fill in the query parameters
- Execute the request
- See the response with pagination metadata

#### **Parameter Validation**

- **Required fields**: Marked with red asterisk (\*)
- **Type validation**: Number inputs for page/limit
- **Default values**: Shown in descriptions
- **Example values**: Provided for easy testing

### 📊 **Response Documentation**

#### **Pagination Metadata**

```json
{
  "pagination": {
    "page": 1, // Current page
    "limit": 10, // Items per page
    "total": 25, // Total items
    "totalPages": 3, // Total pages
    "hasNext": true, // Has next page
    "hasPrev": false // Has previous page
  }
}
```

#### **Data Array**

```json
{
  "data": [
    {
      "_id": "ObjectId",
      "username": "string",
      "email": "string",
      "role": "USER|ADMIN|ROOT",
      "active": "boolean",
      "createdAt": "ISO Date",
      "updatedAt": "ISO Date"
    }
  ]
}
```

## Implementation Details

### 🔧 **Controller Decorators**

#### **GET /api/users**

```typescript
@ApiQuery({
  name: 'page',
  required: false,
  type: Number,
  description: 'Page number (default: 1)',
  example: 1,
})
@ApiQuery({
  name: 'limit',
  required: false,
  type: Number,
  description: 'Items per page (default: 10, max: 100)',
  example: 10,
})
```

#### **GET /api/users/search**

```typescript
@ApiQuery({
  name: 'query',
  required: true,
  type: String,
  description: 'Search term (username)',
  example: 'john',
})
@ApiQuery({
  name: 'page',
  required: false,
  type: Number,
  description: 'Page number (default: 1)',
  example: 1,
})
@ApiQuery({
  name: 'limit',
  required: false,
  type: Number,
  description: 'Items per page (default: 10, max: 100)',
  example: 10,
})
```

### 📝 **Parameter Descriptions**

#### **Page Parameter**

- **Name**: `page`
- **Type**: `Number`
- **Required**: `false`
- **Description**: "Page number (default: 1)"
- **Example**: `1`

#### **Limit Parameter**

- **Name**: `limit`
- **Type**: `Number`
- **Required**: `false`
- **Description**: "Items per page (default: 10, max: 100)"
- **Example**: `10`

#### **Query Parameter**

- **Name**: `query`
- **Type**: `String`
- **Required**: `true`
- **Description**: "Search term (username)"
- **Example**: `john`

## Testing in Swagger UI

### 🧪 **Test Scenarios**

#### **Basic Pagination**

1. Go to `/api/users` endpoint
2. Click "Try it out"
3. Set `page=1`, `limit=5`
4. Execute request
5. Verify pagination metadata

#### **Search with Pagination**

1. Go to `/api/users/search` endpoint
2. Click "Try it out"
3. Set `query=john`, `page=1`, `limit=3`
4. Execute request
5. Verify search results and pagination

#### **Edge Cases**

1. **Page 0**: Should default to page 1
2. **Negative page**: Should default to page 1
3. **Limit > 100**: Should be limited to 100
4. **Empty search**: Should return empty results

### 🔍 **Response Validation**

#### **Pagination Metadata**

- ✅ **page**: Should match requested page
- ✅ **limit**: Should match requested limit
- ✅ **total**: Should be accurate count
- ✅ **totalPages**: Should be calculated correctly
- ✅ **hasNext**: Should be true if more pages exist
- ✅ **hasPrev**: Should be true if previous pages exist

#### **Data Array**

- ✅ **Length**: Should not exceed limit
- ✅ **Structure**: Should match user schema
- ✅ **Fields**: Should include all required fields
- ✅ **Types**: Should have correct data types

## Best Practices

### 🎯 **Documentation**

#### **Clear Descriptions**

- **Purpose**: Explain what each parameter does
- **Defaults**: Show default values clearly
- **Limits**: Specify maximum values
- **Examples**: Provide realistic examples

#### **Parameter Order**

1. **Required parameters first**
2. **Optional parameters second**
3. **Logical grouping** (pagination together)

### 🔒 **Validation**

#### **Input Validation**

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

#### **Error Responses**

```json
{
  "statusCode": 400,
  "message": "Page must be a positive number",
  "error": "Bad Request"
}
```

## Frontend Integration

### 📱 **Swagger UI Testing**

#### **Copy cURL Command**

```bash
curl -X 'GET' \
  'http://localhost:3000/api/users?page=1&limit=10' \
  -H 'accept: application/json' \
  -H 'Cookie: token=your-jwt-token'
```

#### **JavaScript Fetch**

```javascript
const response = await fetch('/api/users?page=1&limit=10', {
  headers: {
    accept: 'application/json',
    Cookie: 'token=your-jwt-token',
  },
});
```

### 🎨 **UI Components**

#### **Pagination Controls**

```html
<div class="pagination-controls">
  <input type="number" name="page" placeholder="Page" min="1" />
  <select name="limit">
    <option value="10">10 per page</option>
    <option value="25">25 per page</option>
    <option value="50">50 per page</option>
    <option value="100">100 per page</option>
  </select>
  <button type="submit">Go</button>
</div>
```

## Monitoring & Analytics

### 📊 **Usage Tracking**

#### **Popular Parameters**

- **Most used page sizes**: Track limit values
- **Navigation patterns**: How users browse pages
- **Search queries**: Popular search terms
- **Performance metrics**: Response times by page size

#### **Error Monitoring**

- **Invalid parameters**: Track validation errors
- **Performance issues**: Monitor slow queries
- **Rate limiting**: Track abuse attempts

¡Los query parameters de paginación están completamente documentados en Swagger! 🎉
