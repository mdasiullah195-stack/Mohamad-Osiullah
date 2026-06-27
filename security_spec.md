# Security Specification - Mohamad Osiullah Showcase Platform

This document describes the security model, access control requirements, data invariants, and adversarial test scenarios for the Firebase Firestore and Authentication integration.

## 1. Data Invariants

1. **Portfolio (`/portfolio/main`)**:
   - Only the designated admin (`mdasiullah195@gmail.com` with a verified email) can update this document.
   - Public readers have read-only access.
   - The document ID must be `main`.

2. **Websites (`/websites/{websiteId}`)**:
   - Only the admin can create, update, or delete websites.
   - Standard visitors can read and increment the `views` or `clicks` fields during visits, but cannot edit other fields (name, url, description, etc.).
   - All website URLs must start with `http://` or `https://`.

3. **Apps (`/apps/{appId}`)**:
   - Only the admin can create, update, or delete mobile applications.
   - Standard visitors can read and increment the `views` or `downloads` fields, but cannot modify other critical details (app icon, binary APK links, categories, version numbers, changelogs, size metadata).
   - Rating can only be updated by the admin.

4. **Contacts (`/contacts/{contactId}`)**:
   - Anyone can write a contact form message.
   - Messages are write-only for visitors (no read, no edit, no delete).
   - Only the admin can read, list, and update `read` status of contact messages.
   - Timestamp must be strictly set to the server's execution time `request.time`.

5. **Roadmap (`/roadmap/{roadmapId}`)**:
   - Only the admin can write, edit, or delete items.
   - Standard visitors can only read roadmap items.

6. **Announcements (`/announcements/{announcementId}`)**:
   - Only the admin can write, edit, or delete announcements.
   - Standard visitors can read active announcements.

7. **Analytics (`/analytics/stats`)**:
   - Public readers can read stats and increment counts, but cannot rewrite arbitrary counter logs or set them to massive figures.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads represent unauthorized attempts to bypass authorization gates, execute update-gaps, or spoof identities. Security rules must block all of them returning `PERMISSION_DENIED`.

### Payload 1: Anonymous User Modifying Admin Profile
- **Path**: `/portfolio/main`
- **Operation**: `update`
- **Payload**: `{"name": "Hacker Person", "title": "Phisher", "bio": "Deconstruct"}`
- **Auth**: None (or standard user `hacker@gmail.com`)
- **Reason to Block**: User is not the designated admin.

### Payload 2: Admin Privilege Escalation (Self-Assigned Admin Role)
- **Path**: `/portfolio/main`
- **Operation**: `create`
- **Payload**: `{"name": "Attacker", "isAdmin": true, "email": "attacker@gmail.com"}`
- **Auth**: `attacker@gmail.com`
- **Reason to Block**: Cannot self-promote or create a portfolio document with unapproved fields.

### Payload 3: Spoofed Email Attempting Admin Writes (Unverified Email)
- **Path**: `/portfolio/main`
- **Operation**: `update`
- **Payload**: `{"name": "Mohamad Osiullah", "bio": "Overwritten"}`
- **Auth**: `mdasiullah195@gmail.com` (but `email_verified == false`)
- **Reason to Block**: Admin email must be verified.

### Payload 4: Overwriting Critical Fields of a Website Project (Update-Gap)
- **Path**: `/websites/resume_builder_id`
- **Operation**: `update`
- **Payload**: `{"name": "Malicious Redirect Site", "url": "https://phishing.site"}`
- **Auth**: None
- **Reason to Block**: Non-admin attempts to rewrite primary website details.

### Payload 5: Poisoning App Download Counter
- **Path**: `/apps/app_id`
- **Operation**: `update`
- **Payload**: `{"downloads": 9999999, "name": "Fake App Name", "icon": "https://malicious.ico"}`
- **Auth**: None
- **Reason to Block**: Non-admin attempts to overwrite `downloads` while also altering `name` and `icon` (Ghost Field / Shadow Update).

### Payload 6: Reading Someone Else's Contact Messages
- **Path**: `/contacts/message_123`
- **Operation**: `get` / `list`
- **Payload**: None
- **Auth**: Standard user `user@gmail.com`
- **Reason to Block**: Only the verified admin email is allowed to inspect the contact inbox.

### Payload 7: Deleting Contact Form Records
- **Path**: `/contacts/message_123`
- **Operation**: `delete`
- **Payload**: None
- **Auth**: None
- **Reason to Block**: Visitors have write-only permission.

### Payload 8: Corrupting Roadmap Record (State Shortcutting)
- **Path**: `/roadmap/roadmap_id`
- **Operation**: `update`
- **Payload**: `{"status": "completed", "title": "Bypassed Hack"}`
- **Auth**: None
- **Reason to Block**: Non-admins cannot modify roadmap tasks.

### Payload 9: Global Stats Reset Attack
- **Path**: `/analytics/stats`
- **Operation**: `update`
- **Payload**: `{"visitors": 0, "clicks": 0, "downloads": 0, "views": 0}`
- **Auth**: None
- **Reason to Block**: Public users cannot reset system statistics.

### Payload 10: Injecting Giant Resource Strings into App ID (ID Poisoning / Denial of Wallet)
- **Path**: `/apps/some_really_long_id_exceeding_128_characters_and_including_unsupported_chars_$$$$`
- **Operation**: `create`
- **Payload**: `{"name": "Bloated App"}`
- **Auth**: None
- **Reason to Block**: ID contains invalid characters, lacks validation, and risks database bloat.

### Payload 11: Tampering Contact Form Submission Timestamps
- **Path**: `/contacts/contact_id`
- **Operation**: `create`
- **Payload**: `{"name": "User", "email": "user@gmail.com", "message": "hello", "createdAt": "2000-01-01T00:00:00Z"}`
- **Auth**: None
- **Reason to Block**: Non-server time timestamp injection is forbidden. Must use `request.time`.

### Payload 12: Creating an Announcement without Announcement Permissions
- **Path**: `/announcements/new_notice`
- **Operation**: `create`
- **Payload**: `{"title": "System Down", "message": "All apps infected", "type": "warning", "active": true}`
- **Auth**: Standard user `visitor@gmail.com`
- **Reason to Block**: Non-admins are blocked from writing or updating system notices.

---

## 3. Test Verification Specification

The security rule set must successfully block all 12 payloads described above with a strict security gate. Verification is performed by establishing a clean, unified rule block and verifying permissions in firestore.rules.
