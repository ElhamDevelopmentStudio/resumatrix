# 📄 SDS — API Design

## Project: _VitaForge_

----------

# 1. 🧠 API Design Principles

----------

## 1.1 Architecture Style

-   RESTful API
-   Resource-oriented
-   Stateless requests

----------

## 1.2 Core Rules (ENFORCED)

### Rule 1 — No Business Logic in Routes

Routes:

-   validate input
-   call domain logic
-   return response

----------

### Rule 2 — Consistent Response Shape

All responses follow:

{  
 "success": true,  
 "data": {},  
 "error": null  
}

Error case:

{  
 "success": false,  
 "data": null,  
 "error": {  
 "message": "Description",  
 "code": "ERROR_CODE"  
 }  
}

----------

### Rule 3 — IDs Are UUIDs

All resources:

-   use UUIDs
-   never expose internal DB logic

----------

# 2. 🔐 Auth API

----------

## 2.1 Login

### POST `/api/auth/login`

**Request:**

{  
 "username": "admin",  
 "password": "password"  
}

**Response:**

{  
 "success": true,  
 "data": {  
 "token": "jwt_or_session"  
 }  
}

----------

## 2.2 Logout

### POST `/api/auth/logout`

----------

## 2.3 Get Current User

### GET `/api/auth/me`

----------

# 3. 🧱 Core Data APIs

----------

# 3.1 Experiences

----------

### GET `/api/experiences`

Returns all experiences

----------

### POST `/api/experiences`

Create new experience

{  
 "company": "",  
 "role": "",  
 "start_date": "",  
 "end_date": "",  
 "location": "",  
 "bullets": [],  
 "tags": []  
}

----------

### PUT `/api/experiences/:id`

Update experience

----------

### DELETE `/api/experiences/:id`

----------

# 3.2 Projects

----------

### GET `/api/projects`

### POST `/api/projects`

{  
 "name": "",  
 "description": "",  
 "tech_stack": [],  
 "bullets": [],  
 "tags": []  
}

----------

### PUT `/api/projects/:id`

### DELETE `/api/projects/:id`

----------

# 3.3 Education

----------

### GET `/api/education`

### POST `/api/education`

### PUT `/api/education/:id`

### DELETE `/api/education/:id`

----------

# 3.4 Skills

----------

### GET `/api/skills`

### POST `/api/skills`

### PUT `/api/skills/:id`

### DELETE `/api/skills/:id`

----------

# 3.5 Personal Info

----------

### GET `/api/personal`

### PUT `/api/personal`

(single record update)

----------

# 3.6 Contacts

----------

### GET `/api/contacts`

### POST `/api/contacts`

### PUT `/api/contacts/:id`

### DELETE `/api/contacts/:id`

----------

# 4. 🧩 Profile APIs

----------

## 4.1 Get Profiles

### GET `/api/profiles`

----------

## 4.2 Create Profile

### POST `/api/profiles`

{  
 "name": "Frontend Developer",  
 "include_tags": ["frontend"],  
 "exclude_tags": ["backend-heavy"],  
 "config": {}  
}

----------

## 4.3 Update Profile

### PUT `/api/profiles/:id`

----------

## 4.4 Delete Profile

### DELETE `/api/profiles/:id`

----------

# 5. 🎨 Template APIs

----------

## 5.1 Get Templates

### GET `/api/templates`

----------

## 5.2 Get Template Detail

### GET `/api/templates/:id`

----------

👉 Templates are mostly static (seeded or local)

----------

# 6. 📄 CV APIs

----------

## 6.1 Get CVs

### GET `/api/cvs`

----------

## 6.2 Create CV

### POST `/api/cvs`

{  
 "profile_id": "uuid",  
 "template_id": "uuid",  
 "name": "Frontend CV v1"  
}

----------

## 6.3 Get CV Detail

### GET `/api/cvs/:id`

Returns:

{  
 "cv": {},  
 "profile": {},  
 "template": {},  
 "data": {}  
}

----------

## 6.4 Update CV

### PUT `/api/cvs/:id`

Used for:

-   renaming
-   updating overrides

----------

## 6.5 Delete CV

### DELETE `/api/cvs/:id`

----------

# 7. 🧠 Render API (VERY IMPORTANT)

----------

## 7.1 Get Render Model

### GET `/api/cvs/:id/render`

----------

## Purpose

Returns fully processed data:

DB → Profile Filter → Overrides → Final Model

----------

## Response:

{  
 "success": true,  
 "data": {  
 "render_model": { ... }  
 }  
}

----------

👉 This endpoint powers:

-   preview
-   export

----------

# 8. ⚙️ Override APIs

----------

## 8.1 Update Overrides

### PUT `/api/cvs/:id/overrides`

{  
 "overrides": { ... }  
}

----------

## 8.2 Partial Update

-   merge with existing overrides
-   do not overwrite entire object

----------

# 9. 📄 Export API

----------

## 9.1 Generate PDF

### POST `/api/cvs/:id/export/pdf`

----------

## Flow:

Fetch Render Model → Apply Template → Generate PDF → Return file

----------

## Response:

-   file stream OR download URL

----------

# 10. ⚡ Editor APIs (Optimized for UX)

----------

## 10.1 Batch Update (OPTIONAL FUTURE)

### POST `/api/batch`

Used for:

-   multiple updates in one request

----------

## 10.2 Autosave Behavior

Frontend:

-   debounced updates
-   sends PATCH/PUT requests

----------

# 11. 🧪 Validation Rules

----------

## 11.1 Required Fields

-   experience must have:
    -   company
    -   role

----------

## 11.2 Input Sanitization

-   trim strings
-   normalize tags (lowercase)

----------

## 11.3 Bullet Validation

-   must be array
-   remove empty entries

----------

# 12. ⚠️ Error Handling

----------

## 12.1 Common Errors

Code

Meaning

NOT_FOUND

resource missing

VALIDATION_ERROR

bad input

UNAUTHORIZED

auth failed

----------

## 12.2 Behavior

-   never crash
-   always return structured error

----------

# 13. 🔐 Security Considerations

----------

-   protect all routes behind auth
-   validate all inputs
-   prevent injection (basic sanitation)

----------

# 14. 🚀 Performance Strategy

----------

## 14.1 Avoid Over-fetching

-   CV detail endpoint may include all required data
-   minimize multiple requests

----------

## 14.2 Cache Render Model

(optional future)

----------

# 15. 🔥 AI Integration Strategy (IMPORTANT)

This is how you’ll use this:

----------

## Example Prompt to Codex:

Implement POST /api/experiences based on the VitaForge API spec.  
  
Requirements:  
- validate input  
- insert into database  
- return standardized response  
- handle errors  
  
Schema:  
[include DB schema section]  
  
Response format:  
[include API response contract]

----------

👉 Because your API is now structured:

-   AI won’t hallucinate endpoints
-   AI won’t mix logic layers
-   AI will stay consistent

----------

# 16. 🧠 Final System Flow (End-to-End)

----------

User edits form  
 ↓  
Frontend updates state  
 ↓  
API updates DB / overrides  
 ↓  
Render API generates model  
 ↓  
Template renders preview  
 ↓  
Export API generates PDF