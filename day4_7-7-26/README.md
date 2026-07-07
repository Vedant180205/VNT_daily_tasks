# Day 4: Advanced File Upload & Form Handling 🚀

This documentation provides a comprehensive, deep-dive into the technical implementation of the Advanced File Upload system. It details the architecture, the specific problem-solving methodologies used for each task, and the robust edge-case protections built into both the frontend and backend.

---

## 🏗️ 1. Backend API & File Handling Architecture

**The Requirement:** Create an endpoint `POST /api/players` that accepts standard text fields (`name`, `email`, `phone`, `team_id`), a single `avatar` image, and up to 5 `gallery` images. Crucially, images must **not** be stored in the database as base64 or binary data.

**How We Solved It:**
We implemented `multer` to handle `multipart/form-data` requests. We created a dedicated configuration file (`backend/src/middleware/uploadMiddleware.js`) with the following logic:
- **Disk Storage:** We configured `multer.diskStorage()` to save files directly to the server's hard drive at `/uploads/players/avatar/` and `/uploads/players/gallery/`.
- **Collision Prevention:** To prevent files from overwriting each other, we generated unique filenames using `Date.now() + '-' + Math.round(Math.random() * 1E9)`.
- **Original Filename Preservation:** To aid in duplicate detection later, we appended the sanitized original filename to the end of the unique hash (e.g., `1783421902158-966155675-my_dog.jpg`).
- **Security Limits:** We injected a `fileFilter` to strictly allow only `image/jpeg`, `image/jpg`, and `image/png`. We also enforced a hard limit of `2MB` per file.

## 💾 2. Database Mapping Strategy

**The Requirement:** Store only the file paths in the database.

**How We Solved It:**
In `backend/src/controllers/playerController.js`, we intercept the `req.files` object populated by `multer`. 
- For the `avatar`, we map the first array element's filename to a static URL path string (`/uploads/players/avatar/...`).
- For the `gallery`, we map the entire array of uploaded files into an array of URL path strings, which is then serialized into JSON before saving to the database. This keeps the database incredibly lightweight and query times extremely fast.

## 🧹 3. File Lifecycle & Deletion Management

**The Requirement:** When a user updates a player profile, old images must be deleted to prevent server bloat.

**How We Solved It:**
Updating files is significantly harder than creating them, because the user might want to keep some gallery images, delete others, and add new ones all at the same time.
We engineered a **"Retained Gallery Tracking"** system:
1. When editing, the frontend passes back an array called `retained_gallery`, containing the URLs of the images the user *did not* delete from the UI.
2. In `backend/src/services/playerService.js`, we pull the original gallery array from the database.
3. We diff the two arrays. If an image exists in the database but is missing from the `retained_gallery` list, the backend immediately calls `fs.unlinkSync()` to permanently delete that file from the server's hard drive.
4. We then merge the `retained_gallery` array with any newly uploaded files and save the updated list to the database.

## 🖥️ 4. Frontend API Integration & Progress Tracking

**The Requirement:** Handle multipart forms in React, and show live upload progress.

**How We Solved It:**
- **FormData API:** Standard JSON payloads cannot transmit files. We refactored `playerApi.ts` and the React Query hooks to construct native `FormData` objects and send them with a `multipart/form-data` header.
- **Upload Progress:** We tapped into Axios's native `onUploadProgress` event handler. As the browser sends data chunks to the server, we calculate the percentage (`Math.round((loaded * 100) / total)`) and pass this state directly into `PlayerForm.tsx` to animate a visual progress bar.

## 🖼️ 5. Dynamic UX Components (`ImageUploader.tsx`)

**The Requirement:** Preview images before upload and allow removal.

**How We Solved It:**
Instead of waiting for files to upload to see them, we utilized the browser's native `URL.createObjectURL(file)` API. This generates a temporary, zero-latency URL pointing directly to the `File` object in the user's RAM. 
When a user clicks the 'X' button on a preview, we simply filter that file out of the React state array, instantly updating the UI.

---

## 🛡️ The Dual-Layer Defense Strategy (Edge Case Protection)

The assignment specified strict edge cases (User uploads 10 images, same file uploaded twice). 
We implemented protections for these edge cases in **two separate places**: on the frontend UI, and on the backend server. 

### Why Validate Twice?
- **Backend (The Security Layer):** *Rule: Never trust the client.* If we only put limits on the frontend, a malicious user could bypass the browser entirely (using Postman or a script) and flood the server with 10,000 images. The backend acts as an impenetrable wall.
- **Frontend (The UX Layer):** *Rule: Respect the user's time.* Relying solely on server errors provides terrible User Experience (UX). If a user selects 6 images, allowing them to wait for the entire upload to process just to get a server error is highly frustrating. The frontend guides the user to fix mistakes *before* they make a network request.

### Example 1: The "Too Many Images" Edge Case
- **Frontend Prevention:** When a user selects a batch of images, `ImageUploader.tsx` calculates `existing images + new images`. If the total exceeds 5, the frontend completely rejects the batch, instantly displaying a red warning: *"Cannot add files. Maximum of 5 images allowed."*
- **Backend Prevention:** If bypassed, `validatePlayer.js` counts the `req.files['gallery'].length` combined with the `retained_gallery` length. If it exceeds 5, it terminates the request and throws a `400 Bad Request`.

### Example 2: The "Duplicate File" Edge Case
- **Frontend Prevention:** If a user drags in a duplicate image, the frontend accepts it into the preview box but instantly wraps it in a **thick red border** with a "Duplicate" badge. It then propagates an error state up to the main form, dynamically disabling the "Save Changes" button until the user resolves the error.
- **Backend Prevention:** If bypassed, `validatePlayer.js` extracts the `originalname` of all files in the batch, places them into a JavaScript `Set`, and compares the sizes. If duplicates exist, it throws a `400 Bad Request: Duplicate images found`.

---

## 📮 6. Postman Automation Suite

**The Requirement:** Automate the testing of the backend edge cases.

**How We Solved It:**
We created a comprehensive JSON Postman collection featuring 5 specific POST requests simulating form-data:
1. **Valid Upload:** Happy path with 1 avatar and 3 gallery images (Expect 201).
2. **No Avatar:** Simulating a missing required field (Expect 400).
3. **Too Many Images:** Uploading 6+ gallery images to trigger the backend limit (Expect 400).
4. **Wrong File Type:** Attempting to upload PDFs or text files to trigger the Multer fileFilter (Expect 400).
5. **Large File:** Attempting to upload a >2MB file to trigger the Multer size limit (Expect 400).
