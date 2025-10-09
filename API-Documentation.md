# PnutGo API Documentation

This document provides comprehensive documentation for all PnutGo API endpoints, including request parameters, response structures, and example usage.

## Table of Contents

- [Authentication](#authentication)
- [Base URLs](#base-urls)
- [Common Response Formats](#common-response-formats)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [User Profile](#user-profile)
  - [Companions](#companions)
  - [Map & Spawns](#map--spawns)
  - [Quests](#quests)

## Authentication

The PnutGo API uses Laravel Sanctum for authentication. Most endpoints require authentication using bearer tokens.

### Authentication Endpoints

#### Login
```http
POST /auth/login
```

**Authentication**: None required

**Parameters**:
- `username` (string, required) - Email address or phone number
- `password` (string, required if email) - Password for email-based authentication
- `otp` (string, required if phone) - One-time password for phone-based authentication

**Example Request (Email)**:
```json
{
  "username": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Example Request (Phone)**:
```json
{
  "username": "+1234567890",
  "otp": "12345"
}
```

**Response (Success)**:
```json
{
  "data": {
    "access_token": "1|abcdef1234567890abcdef1234567890abcdef12",
    "token_type": "bearer",
    "expires_in": "2025-01-20T15:30:00.000000Z",
    "user": {
      "id": 1,
      "full_name": "John Doe",
      "first_name": "John",
      "last_name": "Doe",
      "email": "user@example.com",
      "phone_number": "+1234567890",
      "email_verified": true,
      "phone_number_verified": true,
      "verified": true,
      "primary_username": "email",
      "avatar_permanent_url": "http://localhost:8000/api/users/1/avatar?timestamp=1642694400",
      "avatar_permanent_thumb_url": "http://localhost:8000/api/users/1/avatar/thumb?timestamp=1642694400",
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    }
  }
}
```

#### Register
```http
POST /auth/register
```

**Authentication**: None required

**Parameters (Email Registration)**:
- `email` (string, required) - Valid email address
- `password` (string, required) - Password (min 8 chars, mixed case, numbers, symbols)
- `password_confirmation` (string, required) - Password confirmation
- `first_name` (string, optional) - User's first name
- `last_name` (string, optional) - User's last name

**Parameters (Phone Registration)**:
- `phone_number` (string, required) - Valid phone number with country code
- `otp` (string, required) - One-time password sent to phone
- `first_name` (string, optional) - User's first name
- `last_name` (string, optional) - User's last name

**Example Request (Email)**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "password_confirmation": "SecurePassword123!",
  "first_name": "Jane",
  "last_name": "Smith"
}
```

**Example Request (Phone)**:
```json
{
  "phone_number": "+1234567890",
  "otp": "12345",
  "first_name": "Jane",
  "last_name": "Smith"
}
```

**Response**: Same as login response format

#### Logout
```http
POST /auth/logout
```

**Authentication**: Required (Bearer Token)

**Response**:
```json
{
  "message": "Successfully logged out"
}
```

#### Get Current User
```http
GET /auth/me
```

**Authentication**: Required (Bearer Token)

**Response**:
```json
{
  "id": 1,
  "full_name": "John Doe",
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "phone_number": "+1234567890",
  "email_verified": true,
  "phone_number_verified": true,
  "verified": true,
  "primary_username": "email",
  "avatar_permanent_url": "http://localhost:8000/api/users/1/avatar?timestamp=1642694400",
  "avatar_permanent_thumb_url": "http://localhost:8000/api/users/1/avatar/thumb?timestamp=1642694400",
  "mine": true,
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
```

**Authentication**: None required

**Parameters**:
- `email` (string, required) - Email address of the account

**Response**:
```json
{
  "message": "Password reset link sent to your email"
}
```

#### Reset Password
```http
POST /auth/reset-password
```

**Authentication**: None required

**Parameters**:
- `token` (string, required) - Password reset token from email
- `email` (string, required) - Email address
- `password` (string, required) - New password
- `password_confirmation` (string, required) - Password confirmation

**Response**:
```json
{
  "message": "Password has been reset successfully"
}
```

#### Generate OTP
```http
POST /auth/otp/generate
```

**Authentication**: None required

**Parameters**:
- `phone_number` (string, required) - Phone number to send OTP to

**Response**:
```json
{
  "message": "OTP sent successfully"
}
```

#### Email Verification
```http
POST /auth/verification/verify
```

**Authentication**: Required (Bearer Token)

**Parameters**:
- `verification_code` (string, required) - Verification code sent to email/phone

**Response**:
```json
{
  "message": "Verification successful"
}
```

#### Resend Verification
```http
POST /auth/verification/resend
```

**Authentication**: Required (Bearer Token)

**Response**:
```json
{
  "message": "Verification code sent"
}
```

### Using Authentication Tokens

Include the bearer token in the Authorization header for authenticated endpoints:

```http
Authorization: Bearer 1|abcdef1234567890abcdef1234567890abcdef12
```

## Base URLs

- **Development**: `http://localhost:8000/api`
- **Production**: `https://api.pnutgo.com/api`

## Common Response Formats

All API responses follow a consistent JSON structure:

### Success Response
```json
{
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": {
    "field_name": [
      "Validation error message"
    ]
  }
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Authentication Error Codes

When authentication fails, the API returns specific error codes in the response:

```json
{
  "message": "Error description",
  "error_code": "ERROR_CODE_NAME"
}
```

**Common Authentication Error Codes**:
- `INVALID_CREDENTIALS` - Invalid username/password combination
- `INVALID_ONE_TIME_PASSWORD` - Invalid or expired OTP
- `AUTHENTICATION_REQUIRED` - Missing password or OTP
- `AUTHENTICATION_EMAIL_REQUIRED` - Email authentication required for this account
- `AUTHENTICATION_PHONE_NUMBER_REQUIRED` - Phone authentication required for this account
- `ACCOUNT_BLOCKED` - Account has been blocked due to too many failed attempts
- `UNVERIFIED_EMAIL` - Email address not verified
- `UNVERIFIED_PHONE_NUMBER` - Phone number not verified
- `UNVERIFIED_ACCOUNT` - Account requires verification
- `USERNAME_NOT_FOUND` - Username does not exist
- `TOKEN_NOT_FOUND` - Invalid or expired reset token

## Endpoints

### User Profile

#### Get User's Badges
```http
GET /me/badges
```

**Authentication**: Required (Bearer Token)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Water Master",
      "description": "Capture 10 water-type companions",
      "level": 1,
      "requirement": {
        "action": "capture",
        "companion_type": "water",
        "count": 10
      },
      "companion": {
        "id": 5,
        "name": "Aqua Sprite",
        "description": "A playful water companion",
        "type": "water",
        "rarity": "common",
        "created_at": "2025-01-01T00:00:00.000000Z",
        "updated_at": "2025-01-01T00:00:00.000000Z"
      },
      "earned_at": "2025-01-15T10:30:00.000000Z",
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    }
  ]
}
```

#### Get User's Companion Collection
```http
GET /me/companions
```

**Authentication**: Required (Bearer Token)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Fire Drake",
      "description": "A fierce fire-type companion",
      "rarity": "rare",
      "capture_count": 3,
      "first_captured_at": "2025-01-20T09:15:45.000000Z",
      "last_captured_at": "2025-01-20T09:15:45.000000Z"
    },
    {
      "id": 2,
      "name": "Earth Golem",
      "description": "A sturdy earth-type companion",
      "rarity": "epic",
      "capture_count": 1,
      "first_captured_at": "2025-01-18T16:45:12.000000Z",
      "last_captured_at": "2025-01-18T16:45:12.000000Z"
    }
  ]
}
```

### Companions

#### List All Companions
```http
GET /companions
```

**Authentication**: None required

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Fire Drake",
      "description": "A fierce fire-type companion with glowing red scales",
      "personality": "Brave and loyal",
      "traits": ["Fire Breathing", "Heat Resistance"],
      "rarity": "rare",
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    },
    {
      "id": 2,
      "name": "Water Sprite",
      "description": "A playful water companion that loves to splash",
      "personality": "Playful and mischievous",
      "traits": ["Aquatic", "Healing Waters"],
      "rarity": "common",
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    }
  ]
}
```

#### Get Companion Details
```http
GET /companions/{id}
```

**Authentication**: None required

**Parameters**:
- `id` (integer) - Companion ID

**Response**:
```json
{
  "data": {
    "id": 1,
    "name": "Fire Drake",
    "description": "A fierce fire-type companion with glowing red scales",
    "personality": "Brave and loyal",
    "traits": ["Fire Breathing", "Heat Resistance"],
    "rarity": "rare",
    "badges": [
      {
        "id": 1,
        "name": "Fire Starter",
        "description": "Capture your first fire-type companion",
        "level": 1,
        "requirement": {
          "action": "capture",
          "companion_type": "fire",
          "count": 1
        },
        "companion": {
          "id": 1,
          "name": "Fire Drake",
          "description": "A fierce fire-type companion with glowing red scales",
          "personality": "Brave and loyal",
          "traits": ["Fire Breathing", "Heat Resistance"],
          "rarity": "rare",
          "created_at": "2025-01-01T00:00:00.000000Z",
          "updated_at": "2025-01-01T00:00:00.000000Z"
        },
        "created_at": "2025-01-01T00:00:00.000000Z",
        "updated_at": "2025-01-01T00:00:00.000000Z"
      }
    ],
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  }
}
```

### Map & Spawns

#### Get Map Companions
```http
GET /map/companions
```

**Authentication**: Required (Bearer Token)

**Parameters**:
- `lat` (float, required) - User's latitude (-90 to 90)
- `lng` (float, required) - User's longitude (-180 to 180)
- `radius` (float, optional) - Search radius in degrees (0.001 to 0.1, default: 0.01)

**Example Request**:
```http
GET /map/companions?lat=14.5995&lng=120.9842&radius=0.005
```

**Response**:
```json
{
  "data": [
    {
      "id": 123,
      "companion_id": 1,
      "companion": {
        "id": 1,
        "name": "Fire Drake",
        "description": "A fierce fire-type companion",
        "personality": "Brave and loyal",
        "traits": ["Fire Breathing", "Heat Resistance"],
        "rarity": "rare",
        "created_at": "2025-01-01T00:00:00.000000Z",
        "updated_at": "2025-01-01T00:00:00.000000Z"
      },
      "lat": 14.599123,
      "lng": 120.984456,
      "distance": 150.25,
      "visibility_state": "capturable",
      "expires_at": "2025-01-20T15:30:00.000000Z",
      "spawned_at": "2025-01-20T12:30:00.000000Z"
    },
    {
      "id": 124,
      "companion_id": 2,
      "companion": {
        "id": 2,
        "name": "Water Sprite",
        "description": "A playful water companion",
        "personality": "Playful and mischievous",
        "traits": ["Aquatic", "Healing Waters"],
        "rarity": "common",
        "created_at": "2025-01-01T00:00:00.000000Z",
        "updated_at": "2025-01-01T00:00:00.000000Z"
      },
      "lat": 14.600234,
      "lng": 120.985567,
      "distance": 450.75,
      "visibility_state": "shadow",
      "expires_at": "2025-01-20T16:00:00.000000Z",
      "spawned_at": "2025-01-20T13:00:00.000000Z"
    }
  ]
}
```

**Visibility States**:
- `capturable` - Within capture radius (~50m), can be captured
- `shadow` - Within shadow radius (~500m), visible but not capturable
- `hidden` - Outside visibility range, not returned in response

#### Capture Companion
```http
POST /map/spawns/{spawn_id}/capture
```

**Authentication**: Required (Bearer Token)

**Parameters**:
- `spawn_id` (integer) - ID of the spawn to capture

**Response (Success)**:
```json
{
  "message": "Companion captured successfully!",
  "data": {
    "id": 456,
    "user_id": 1,
    "companion_id": 1,
    "companion": {
      "id": 1,
      "name": "Fire Drake",
      "description": "A fierce fire-type companion",
      "personality": "Brave and loyal",
      "traits": ["Fire Breathing", "Heat Resistance"],
      "rarity": "rare",
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    },
    "spawn_id": 123,
    "spawn": {
      "id": 123,
      "companion_id": 1,
      "lat": 14.599123,
      "lng": 120.984456,
      "spawned_at": "2025-01-20T12:30:00.000000Z",
      "expires_at": "2025-01-20T15:30:00.000000Z",
      "captured_by": 1,
      "captured_at": "2025-01-20T14:15:30.000000Z",
      "created_at": "2025-01-20T12:30:00.000000Z",
      "updated_at": "2025-01-20T14:15:30.000000Z"
    },
    "captured_at": "2025-01-20T14:15:30.000000Z",
    "created_at": "2025-01-20T14:15:30.000000Z",
    "updated_at": "2025-01-20T14:15:30.000000Z"
  }
}
```

**Error Responses**:
```json
// Spawn already captured
{
  "message": "The given data was invalid.",
  "errors": {
    "spawn": ["This spawn has already been captured."]
  }
}

// Spawn expired
{
  "message": "The given data was invalid.",
  "errors": {
    "spawn": ["This spawn has expired."]
  }
}

// Too far away
{
  "message": "The given data was invalid.",
  "errors": {
    "spawn": ["You are too far away to capture this companion."]
  }
}
```

### Quests

#### Get Active Quests
```http
GET /quests
```

**Authentication**: Required (Bearer Token)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Daily Water Hunt",
      "description": "Capture 3 water-type companions today",
      "quest_type": "daily",
      "requirement": {
        "action": "capture",
        "companion_type": "water",
        "count": 3
      },
      "reward": {
        "xp": 500,
        "badge_id": 2
      },
      "progress": 1,
      "target": 3,
      "completed": false,
      "completed_at": null,
      "available_from": "2025-01-20",
      "available_to": "2025-01-20",
      "created_at": "2025-01-20T00:00:00.000000Z",
      "updated_at": "2025-01-20T00:00:00.000000Z"
    },
    {
      "id": 2,
      "title": "Explorer's Challenge",
      "description": "Visit the central park location",
      "quest_type": "event",
      "requirement": {
        "action": "visit_location",
        "lat": 14.5995,
        "lng": 120.9842,
        "radius": 100
      },
      "reward": {
        "xp": 1000,
        "companions": [
          {
            "id": 5,
            "count": 1
          }
        ]
      },
      "progress": 0,
      "target": 1,
      "completed": false,
      "completed_at": null,
      "available_from": "2025-01-15",
      "available_to": "2025-01-25",
      "created_at": "2025-01-15T00:00:00.000000Z",
      "updated_at": "2025-01-20T00:00:00.000000Z"
    }
  ]
}
```

**Quest Types**:
- `daily` - Reset daily, auto-assigned to users
- `upcoming` - Future quests, not yet available
- `event` - Special time-limited events

**Requirement Actions**:
- `capture` - Capture companions (by type or specific companion)
- `visit_location` - Visit a specific geographic location
- `complete_quest` - Complete other quests

#### Complete Quest
```http
POST /quests/{quest_id}/complete
```

**Authentication**: Required (Bearer Token)

**Parameters**:
- `quest_id` (integer) - ID of the quest to complete

**Response (Success)**:
```json
{
  "message": "Quest completed successfully!",
  "data": {
    "quest": {
      "id": 1,
      "title": "Daily Water Hunt",
      "description": "Capture 3 water-type companions today",
      "quest_type": "daily",
      "requirement": {
        "action": "capture",
        "companion_type": "water",
        "count": 3
      },
      "reward": {
        "xp": 500,
        "badge_id": 2
      },
      "available_from": "2025-01-20",
      "available_to": "2025-01-20",
      "created_at": "2025-01-20T00:00:00.000000Z",
      "updated_at": "2025-01-20T00:00:00.000000Z"
    },
    "reward": {
      "xp": 500,
      "badge_id": 2
    }
  }
}
```

**Error Responses**:
```json
// Quest not completed yet
{
  "message": "This action is unauthorized.",
  "errors": {
    "quest": ["Quest requirements not yet met."]
  }
}

// Quest already completed
{
  "message": "This action is unauthorized.", 
  "errors": {
    "quest": ["Quest has already been completed."]
  }
}
```

## Data Models

### Companion Rarity Levels
- `common` - Most frequently spawning companions
- `rare` - Less common, higher value companions  
- `epic` - Rare spawns with special abilities
- `legendary` - Extremely rare, highly sought after

### Companion Attributes
- **Personality** - Descriptive personality traits (e.g., "Brave and loyal", "Playful and mischievous")
- **Traits** - Array of special abilities or characteristics (e.g., ["Fire Breathing", "Heat Resistance"])
- **Type System** - Currently not supported in the API responses (companion types are handled internally)

### Geographic Constraints
- **Latitude**: -90 to 90 degrees
- **Longitude**: -180 to 180 degrees
- **Radius**: 0.001 to 0.1 degrees (~100m to 10km)
- **Capture Radius**: ~50 meters from spawn location
- **Shadow Radius**: ~500 meters visibility range

### Time Formats
All timestamps are in ISO 8601 format with UTC timezone:
```
2025-01-20T14:15:30.000000Z
```

Date-only fields use the format:
```
2025-01-20
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- **General endpoints**: 60 requests per minute
- **Map endpoints**: 30 requests per minute (due to GPS processing)
- **Capture endpoints**: 10 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1642694400
```

## WebSocket Events (Future)

Future versions will include real-time features via WebSocket:
- Companion spawn notifications
- Quest progress updates
- Nearby player activities
- Achievement unlocks

## SDK and Libraries

Official SDKs will be available for:
- JavaScript/TypeScript (React Native, Vue, Angular)
- Swift (iOS)
- Kotlin (Android)
- Unity (Game Engine)

## Support

For API support and questions:
- **Documentation**: This file and inline code comments
- **Issues**: Submit GitHub issues for bugs
- **Discord**: Join our developer community
- **Email**: api-support@pnutgo.com

---

*Last updated: January 2025*
*API Version: 1.0*
