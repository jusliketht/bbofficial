Great — I’ll give you a fully actionable, enterprise-grade implementation plan for **(A)** mapping Google OAuth identity → correct user & role, and **(B)** building synchronized, role-aware dashboards for **Admin CA** and **User / CA Firm Staff**. This covers DB schema, backend routes/controllers/services, frontend flow/components, access control, validation steps, tests and acceptance criteria. Use this as a checklist and copy-pasteable implementation plan for FE/BE/DB work.

---

# 1 — Goals (short)

1. Map Google OAuth `sub` (provider id) to the correct `User` record and route users to the appropriate role-specific dashboard.
2. Provide fully functional **Admin CA Dashboard** (platform-level CA admin who controls CA firms & staff) and **User/CA Firm Staff Dashboards** with strict RBAC.
3. Keep FE, BE and DB consistent and testable — robust validations and audit logs.

---

# 2 — Canonical assumptions & role hierarchy

Use the role names we agreed:

- `SUPER_ADMIN`
- `PLATFORM_ADMIN`
- `CA_FIRM_ADMIN` (admin of a CA firm)
- `CA` (CA professional/staff)
- `END_USER`

Special notes:

- A CA firm is an entity (`CAFirm` table). `CA_FIRM_ADMIN` and `CA` users belong to a `CAFirm`.
- `Admin CA` (your phrase) = `CA_FIRM_ADMIN` of a special firm that has elevated privileges to manage other CA firms — this maps to `PLATFORM_ADMIN` or we can grant a specific permission set. (Per you: Admin CA will have full control; implement as `PLATFORM_ADMIN` role or `SUPER_ADMIN`; below we implement via `PLATFORM_ADMIN` with elevated permissions.)
- CA firms can **add** users/members but **cannot delete** end-user accounts (only mark as inactive); firm admins can manage staff and their assignments.

---

# 3 — DB changes & schema (Sequelize / Postgres)

## 3.1 Key tables (with columns)

Use Sequelize migrations to create/update.

### `users` (update)

```sql
id UUID PK
email VARCHAR UNIQUE NOT NULL
full_name VARCHAR
password_hash TEXT NULL
auth_provider VARCHAR(20) -- 'LOCAL' | 'GOOGLE' | ...
provider_id VARCHAR NULL   -- Google `sub` or other provider id
role VARCHAR NOT NULL      -- ENUM: SUPER_ADMIN|PLATFORM_ADMIN|CA_FIRM_ADMIN|CA|END_USER
status VARCHAR             -- active|inactive|suspended
ca_firm_id UUID NULL       -- FK to ca_firms if CA/CA_FIRM_ADMIN
created_at, updated_at
token_version INT DEFAULT 0
```

### `ca_firms`

```sql
id UUID PK
name VARCHAR NOT NULL
admin_user_id UUID NULL -- optional pointer to CA_FIRM_ADMIN
billing_info JSONB
meta JSONB
created_at, updated_at
```

### `user_members` (family members)

```sql
id UUID PK
owner_user_id UUID (EX: End user who added this member)
name, pan, relation, dob, verified boolean
created_at, updated_at
```

### `user_roles_permissions` (optional RBAC fine grain)

Store permissions per role or per user override.

### `audit_logs` (already defined)

### `user_sessions` (already defined)

---

# 4 — Backend: flow for Google OAuth mapping & dashboard routing

## 4.1 OAuth token verification flow (server-side)

1. Frontend obtains `id_token` from Google (client-side Google Sign-In flow).
2. Frontend posts `id_token` to backend endpoint `POST /auth/google` (or `POST /auth/oauth/google`).
3. Backend verifies `id_token` (use Google library or JWKS) — verify `aud`, `exp`, `iss`, and signature. Extract `sub`, `email`, `name`, `picture`.
4. Backend logic:
   - If `provider_id` exists matching `sub` (and `auth_provider='GOOGLE'`) → fetch user and login.
   - Else if a `user` exists with same `email` and `auth_provider='LOCAL'` (i.e., existing local account) → DO NOT auto-assign `provider_id` without user confirmation (security). Instead:
     - Option A (recommended): require user to confirm linking via email OTP or UI flow to avoid account takeover.
     - Option B (if you accept auto-link risk): link provider_id to the user and set `auth_provider='GOOGLE'`. **Prefer Option A**.

   - Else → create new `User` with `auth_provider='GOOGLE'`, `provider_id=sub`, `email`, `full_name=name`. Set `password_hash=null`.
   - If the user has multiple roles, choose role via DB or ask user to pick at first login.

5. Issue JWT + refresh token and return login response.

## 4.2 Endpoint: `POST /auth/google`

Pseudo-controller:

```js
async function googleAuth(req, res) {
  const { id_token } = req.body;
  const payload = await verifyGoogleIdToken(id_token); // sub, email, name
  if (!payload) return res.status(401).json({ error: 'invalid_token' });

  let user = await User.findOne({
    where: { providerId: payload.sub, authProvider: 'GOOGLE' },
  });
  if (!user) {
    // check for existing same email local account
    const existing = await User.findOne({ where: { email: payload.email } });
    if (existing && existing.authProvider === 'LOCAL') {
      // REQUIRE LINK FLOW: send OTP to email / show UI to link accounts
      return res
        .status(409)
        .json({ error: 'account_exists_local', action: 'link_required' });
    }
    // Create new
    user = await User.create({
      email: payload.email,
      fullName: payload.name,
      authProvider: 'GOOGLE',
      providerId: payload.sub,
      role: 'END_USER',
    });
  }

  // if user is CA or belongs to a CA firm, use existing role/ca_firm_id
  // generate tokens and session
  const { accessToken, refreshToken } = await authService.issueTokens(
    user,
    req.deviceInfo
  );
  await AuditLog.create({
    userId: user.id,
    action: 'google_login',
    details: payload,
    ip: req.ip,
  });
  res.cookie('refresh', refreshToken, cookieOpts);
  return res.json({ accessToken, user: sanitizeUser(user) });
}
```

## 4.3 Role & dashboard mapping rules (server)

- Add `role` claim into JWT: `{ sub: userId, role: user.role, caFirmId }`.
- After login (frontend), decode role and route accordingly (see frontend section).
- If user belongs to a CA firm and `role` is `CA` or `CA_FIRM_ADMIN`, include `caFirmId` in JWT.

---

# 5 — Backend: RBAC & authorization middleware

Create middleware `requireRole(...roles)` and `requirePermission(permission)`.

Example (Express):

```js
function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role))
      return res.status(403).json({ error: 'forbidden' });
    next();
  };
}
```

Attach to routes:

- Admin CA routes: `router.use('/admin', authenticate, requireRole('PLATFORM_ADMIN'))`
- CA firm management routes: `authenticate, requireRole('CA_FIRM_ADMIN', 'PLATFORM_ADMIN')`
- CA staff actions: `authenticate, requireRole('CA')` with a check that `req.user.caFirmId` matches `:firmId`.

---

# 6 — Frontend: Google login, mapping & redirect

## 6.1 Login component flow

- Unified `Login` component has:
  - Role quick-select / role dropdown (optional)
  - Manual email+pass
  - Google Sign-In button (client-side)

- When Google `id_token` returned by client, call `POST /auth/google` with `id_token` + optional device info.

## 6.2 Handling server responses

- `200 OK` → `{ accessToken, user }` → store access token in memory (AuthContext), set user, set refresh cookie auto by server. Redirect to appropriate dashboard.
- `409 account_exists_local` → show modal: “An account with this email exists. Link accounts?” Present option: send email OTP to confirm linking. After OTP verified, call `POST /auth/link/google` to attach `providerId` to local user. This prevents account takeover.
- If created new user and role is END_USER, route to `/dashboard`. If role is CA/CA_FIRM_ADMIN route to `/ca/clients` or `/firm/dashboard` depending.

## 6.3 Dashboard redirect logic (frontend)

- In `onAuthSuccess(user)`:

```js
switch (user.role) {
  case 'SUPER_ADMIN':
    return navigate('/admin/super');
  case 'PLATFORM_ADMIN':
    return navigate('/admin/platform');
  case 'CA_FIRM_ADMIN':
    return navigate('/firm/dashboard');
  case 'CA':
    return navigate('/ca/clients');
  case 'END_USER':
    return navigate('/dashboard');
  default:
    return navigate('/dashboard');
}
```

- If user has multiple roles, present a **role selector modal** to choose for the session; store `activeRole` in AuthContext (session-level, not permanent).

---

# 7 — Dashboard features overview & FE/BE mapping

## 7.1 Admin CA Dashboard (PLATFORM_ADMIN)

**Frontend components**

- `AdminPlatformDashboard.jsx`:
  - Header: global search, notifications, admin quick actions.
  - CA Firms table: list, filters, invite CA firms (POST `/admin/ca-firms`).
  - CA Staff summary: count active staff per firm.
  - Audit & logs viewer (paginated).
  - Global feature flag toggles.
  - User & session management: view sessions, force logout (API: `POST /admin/users/:id/revoke_all`).

**Backend endpoints**

- `GET /admin/ca-firms` (list with pagination/filters) — maps to `CAFirm` model.
- `POST /admin/ca-firms` — create firm and assign `PLATFORM_ADMIN` if needed.
- `GET /admin/audit` — search audit logs (permissioned).
- `POST /admin/ca-firms/:id/assign-admin` — set CA firm admin.

**DB mapping**

- `ca_firms` table stores admin_user_id, staff_count derived via query: `SELECT COUNT(*) FROM users WHERE ca_firm_id = X AND role IN ('CA','CA_FIRM_ADMIN')`.

## 7.2 CA Firm Admin Dashboard (`CA_FIRM_ADMIN`)

**Frontend**

- `FirmAdminDashboard.jsx`:
  - Firm overview (clients count, filings pending).
  - Staff management: invite staff (POST `/firm/:id/staff/invite`), list staff, deactivate staff.
  - Client assignment: list clients assigned to staff, reassign.
  - Billing view: invoices grid (read-only in MVP).
  - Tickets: view tickets for firm's filings.

**Backend**

- `GET /firm/:id/overview`
- `POST /firm/:id/staff` (invite)
- `PUT /firm/:id/staff/:staffId` (update role/active)
- `GET /firm/:id/clients`

**Access control**

- Middleware to ensure `req.user.caFirmId === req.params.id` or `user.role === 'PLATFORM_ADMIN'`.

## 7.3 CA Staff Dashboard (`CA`)

- `CADashboard.jsx`:
  - Assigned clients list, quick actions (open filing, message user).
  - Filing queue: draft → review → submit.
  - Service tickets: create/respond to support tickets.

- Backend shape: `GET /ca/clients`, `GET /ca/filings?assignedTo=userId`.

## 7.4 End User Dashboard

- `UserDashboard.jsx`:
  - Quick start: start filing (self / member / add new).
  - Member management panel (link to `/members` routes).
  - Document manager (`/documents`)
  - Filing history & status.

**Mapping**

- All UI actions map to BE endpoints listed earlier (`/itr`, `/documents`, `/members`, `/tickets`).

---

# 8 — Validation & business rules (enterprise)

## 8.1 Provider account linking (prevent takeover)

- When `email` already exists with LOCAL provider, require explicit confirmation to link Google account:
  - Send OTP to email or ask user to login with local password and then link.
  - Log audit event `account_link_request`.
  - On failure > N times, block linking attempts temporarily.

## 8.2 CA firm assignment rules

- Only `PLATFORM_ADMIN` or `CA_FIRM_ADMIN` can create staff under a firm.
- `CA` staff can be invited but cannot change `ca_firm_id`.
- `CA_FIRM_ADMIN` cannot delete end-user accounts; can only create or deactivate staff.

## 8.3 Role elevation/delegation

- Only `PLATFORM_ADMIN` (or `SUPER_ADMIN`) can grant `PLATFORM_ADMIN` / `CA_FIRM_ADMIN` / `SUPER_ADMIN` roles.

---

# 9 — Tests & acceptance criteria

## 9.1 Integration tests (BE)

- Google auth:
  - `POST /auth/google` with valid id_token → creates user if new, or returns existing user with tokens.
  - `POST /auth/google` where email exists as LOCAL → returns `409 account_exists_local`.
  - Linking flow: `POST /auth/link/google` with OTP → binds `providerId` to local user.

- Role-based access:
  - `GET /admin/ca-firms` only accessible by `PLATFORM_ADMIN` & `SUPER_ADMIN`.
  - `POST /firm/:id/staff` accessible only by `CA_FIRM_ADMIN` for matching firm.

- Session continuity:
  - Login on mobile stores refresh token and reauth works silently after app restart.

- Audit logs:
  - Every auth & linking action produces audit log rows.

## 9.2 Frontend E2E

- Google sign-in flows:
  - New user: Google sign-in → redirected to `/dashboard` as `END_USER`.
  - Existing local user (same email) → link modal shown, OTP sent, link completed, redirect to dashboard.

- Dashboard routing:
  - After login, user lands in correct dashboard based on `role` claim.

- CA firm management:
  - CA_FIRM_ADMIN invites staff → staff gets invite email & can accept.

---

# 10 — Operational & security notes

- **Token claims**: include `role`, `caFirmId` in JWT to minimize DB hits for routing decisions; validate `tokenVersion` on each request.
- **Audit**: every privilege/action (create firm, assign staff, change role) should log under `audit_logs`.
- **Rate limit**: protect invite endpoints and linking endpoints (limit abuses).
- **Email workflows**: OTPs & invites must be signed tokens with TTL, stored hashed in DB until used.
- **Privacy**: do not expose CA firm private fields unless authorized.

---

# 11 — Deliverables (what I can generate for you right now)

If you want, I will produce any of the following immediately:

- A Sequelize migration for `users` + `ca_firms` + `user_sessions` changes.
- The Express `POST /auth/google` controller and `POST /auth/link/google` controller skeletons with audit logging.
- RBAC middleware `requireRole` and an example route mapping for the Admin CA dashboard.
- Frontend pseudo-code for `Login` + `AuthContext` routing + role-based redirect and "link account" modal flow.
- E2E test scenarios in Cypress for the Google auth + dashboard redirection flow.

Tell me which deliverable you want first and I’ll output the code-ready scaffolds.
