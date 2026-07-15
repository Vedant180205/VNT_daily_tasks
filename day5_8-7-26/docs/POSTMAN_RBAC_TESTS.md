# Postman RBAC Testing Guide

This guide provides the exact requests you need to set up in Postman to verify that the Role-Based Access Control (RBAC) system is working correctly.

---

## 1. Create Test Users

First, we need to create three users and assign them different roles. We'll do this directly via the `/api/auth/register` endpoint.

> [!NOTE]
> Based on our database seed:
> - **Role ID 1** = Admin
> - **Role ID 2** = Sub Admin
> - **Role ID 3** = User

### 1a. Register Admin
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/register`
- **Body** (JSON):
```json
{
  "name": "Admin Tester",
  "email": "admin@test.com",
  "password": "password123",
  "role_id": 1
}
```

### 1b. Register Sub Admin
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/register`
- **Body** (JSON):
```json
{
  "name": "Sub Admin Tester",
  "email": "subadmin@test.com",
  "password": "password123",
  "role_id": 2
}
```

### 1c. Register Basic User
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/register`
- **Body** (JSON):
```json
{
  "name": "User Tester",
  "email": "user@test.com",
  "password": "password123",
  "role_id": 3
}
```

---

## 2. Generate Tokens (Login)

For each of the tests below, you will need to log in as the specific user to get their JWT token.

- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/login`
- **Body** (JSON):
```json
{
  "email": "admin@test.com", 
  "password": "password123"
}
```
*(Swap the email to `subadmin@test.com` or `user@test.com` to get the respective tokens)*

Copy the `token` from the response. You will place this in the **Headers** tab for the following tests:
- **Key**: `Authorization`
- **Value**: `Bearer <YOUR_TOKEN>`

### How to Logout / Switch Users in Postman
Because this API uses stateless **JSON Web Tokens (JWT)** instead of cookies or server-side sessions, there is no `/api/auth/logout` endpoint on the backend. 

**To "logout" or switch users in Postman, simply:**
1. Hit the `/login` endpoint again with a different user's credentials.
2. Copy the newly generated token.
3. Replace the token in your **Authorization** header for the tests. 
*(If you want to test an unauthenticated request, just uncheck or delete the `Authorization` header!)*

---

## 3. Test Scenarios

### Scenario A: Admin Access (Should succeed for everything)

**1. Create a Team (Requires `create_teams`)**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/teams`
- **Auth**: Admin Token
- **Body** (JSON):
```json
{
  "name": "The Admin Team"
}
```
- **Expected Result**: `201 Created` - Team is created.

**2. Delete a Player (Requires `delete_players`)**
- **Method**: `DELETE`
- **URL**: `{{base_url}}/api/players/1` *(Ensure player ID 1 exists)*
- **Auth**: Admin Token
- **Expected Result**: `200 OK` - Player soft deleted.

---

### Scenario B: Sub Admin Access (Partial Access)

**1. Create a Team (Requires `create_teams`)**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/teams`
- **Auth**: Sub Admin Token
- **Body** (JSON):
```json
{
  "name": "The Sub Admin Team"
}
```
- **Expected Result**: `403 Forbidden` - Access Denied (Sub Admins only have `view_teams`).

**2. View Players (Requires `view_players`)**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/players`
- **Auth**: Sub Admin Token
- **Expected Result**: `200 OK` - Returns paginated players list.

**3. Delete a Player (Requires `delete_players`)**
- **Method**: `DELETE`
- **URL**: `{{base_url}}/api/players/1`
- **Auth**: Sub Admin Token
- **Expected Result**: `403 Forbidden` - Access Denied.

---

### Scenario C: User Access (Read Only)

**1. View Teams (Requires `view_teams`)**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/teams`
- **Auth**: User Token
- **Expected Result**: `200 OK` - Returns list of teams.

**2. Create a Player (Requires `create_players`)**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/players`
- **Auth**: User Token
- **Body** (JSON):
```json
{
  "name": "Test Player",
  "email": "test@player.com",
  "phone": "1234567890",
  "team_id": 1,
  "role": "Batsman"
}
```
- **Expected Result**: `403 Forbidden` - Access Denied.
