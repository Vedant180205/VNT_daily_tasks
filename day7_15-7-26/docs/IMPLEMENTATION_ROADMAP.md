# Implementation Roadmap: Advanced File Upload + Form Handling

This document breaks down the implementation of the "Multi-Image + Form Submission" task into logical, independently testable stages, designed to minimize regression risk in the Player Management System.

---

## Stage 1: Database Schema Modification

**Objective:**
Update the database schema to support storing file paths for the avatar and gallery images.

**Files Expected To Change:**
- `backend/migrations/[timestamp]_add_image_columns_to_players.sql` (New)
- `backend/src/models/playerModel.js`

**Reason Those Files Need Modification:**
- **SQL Migration**: We need to alter the `players` table to add an `avatar` column (VARCHAR) and a `gallery` column. Since MySQL 5.7.8+ supports the JSON data type, `gallery` should be a `JSON` column to store an array of file paths natively without needing a separate one-to-many junction table, satisfying the requirement `gallery = ["/path1", "/path2"]`.
- **playerModel.js**: Needs to be updated to retrieve, insert, and update these new columns.

**Dependencies:**
- None.

**Potential Risks:**
- Migrations modifying existing tables can lock the table; though safe in local dev, it requires care.
- Fetching JSON columns requires slight parsing changes in the model.

**Validation Needed:**
- Manual execution of the SQL file in the database.
- Verify `DESCRIBE players;` reflects the new columns.

**Estimated Complexity:**
Low

**Status:**
Pending

---

## Stage 2: Backend Upload Infrastructure (Multer)

**Objective:**
Configure the robust file upload infrastructure utilizing `multer` with strict validation, storage targeting, and filtering.

**Files Expected To Change:**
- `backend/package.json`
- `backend/src/middleware/uploadMiddleware.js` (New)
- `backend/src/utils/fileUtils.js` (New)
- `backend/src/app.js`

**Reason Those Files Need Modification:**
- **package.json**: Need to install `multer`.
- **uploadMiddleware.js**: Must configure `multer.diskStorage` to dynamically route files to `/uploads/players/avatar/` or `/uploads/players/gallery/` based on the field name. Must enforce the 2MB size limit and `fileFilter` for `.jpg`/`.png` only. Must configure `multer.fields()` for `{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 5 }`.
- **fileUtils.js**: Utility functions to safely delete existing files via `fs.unlink` when an update occurs.
- **app.js**: Expose the `/uploads` directory statically so the frontend can retrieve the images via `express.static()`.

**Dependencies:**
- Stage 1 (Schema update)

**Potential Risks:**
- Directory creation failure. Multer disk storage expects the destination directories to exist, or logic must be written to recursively create them (`fs.mkdirSync`).
- Malicious file uploads bypassing basic extension checks.

**Validation Needed:**
- Isolated tests writing dummy files to ensure directories are created and files are saved correctly.
- Verify 2MB and format limits reject files instantly.

**Estimated Complexity:**
Medium

**Status:**
Pending

---

## Stage 3: Backend Route & Error Handling Integration

**Objective:**
Integrate the multer middleware into the player routes and ensure specific multer errors (like "Too many files" or "File too large") are caught gracefully by the Global Error Handler.

**Files Expected To Change:**
- `backend/src/routes/playerRoutes.js`
- `backend/src/middleware/errorHandler.js`
- `backend/src/middleware/validatePlayer.js`

**Reason Those Files Need Modification:**
- **playerRoutes.js**: Attach the `uploadMiddleware` before the `validatePlayer` middleware and controller on `POST /api/players` and `PUT /api/players/:id`.
- **errorHandler.js**: `multer` throws specific errors (e.g., `LIMIT_FILE_SIZE`, `LIMIT_UNEXPECTED_FILE`). The global error handler must intercept these and return a clean HTTP 400 response.
- **validatePlayer.js**: Must be updated to parse `req.body` correctly now that it arrives as `multipart/form-data`. It also needs to manually check that `req.files['avatar']` exists (rejecting if no avatar is provided).

**Dependencies:**
- Stage 2 (Multer configured)

**Potential Risks:**
- `multer` consumes the stream; if the upload fails, `req.body` might be empty when it reaches validation.
- Joi/Custom validation logic designed for JSON might fail on `multipart/form-data` strings (e.g., numbers sent as strings).

**Validation Needed:**
- Trigger "Too many files" and verify a JSON error is returned instead of a server crash.

**Estimated Complexity:**
Medium

**Status:**
Pending

---

## Stage 4: Service & Controller Business Logic

**Objective:**
Handle the transformation of file arrays into database-ready paths, and implement the "Delete old images on update" requirement.

**Files Expected To Change:**
- `backend/src/controllers/playerController.js`
- `backend/src/services/playerService.js`

**Reason Those Files Need Modification:**
- **playerController.js**: Extract `req.files` and attach the generated file paths to the `req.body` object before passing it to the service.
- **playerService.js**: 
  - On **Create**: Map the file arrays into the required database string formats (`avatar = "/uploads/..."`, `gallery = ["/uploads/...", ...]`).
  - On **Update**: Fetch the existing player first. If new files are uploaded, trigger `fileUtils.deleteFile` on the old paths to prevent orphan files, then update the database with the new paths.

**Dependencies:**
- Stage 3

**Potential Risks:**
- Handling identical file uploads gracefully.
- Ensuring that updating a player *without* providing new files doesn't accidentally wipe out their existing images.

**Validation Needed:**
- Full backend integration test via Postman (Valid upload, Update with new images, Update without new images).

**Estimated Complexity:**
High

**Status:**
Pending

---

## Stage 5: Frontend Component Architecture

**Objective:**
Build the UI components for file uploads, including previews and removal capabilities.

**Files Expected To Change:**
- `frontend/src/components/players/ImageUploader.tsx` (New)
- `frontend/src/components/players/PlayerForm.tsx`

**Reason Those Files Need Modification:**
- **ImageUploader.tsx**: A new reusable component handling file input, rendering `URL.createObjectURL` previews, and offering a "Remove" button per image. Must enforce max 5 images logic visually.
- **PlayerForm.tsx**: Integrate `ImageUploader` for both Avatar and Gallery. Convert form submission logic to construct a `FormData` object instead of a JSON object.

**Dependencies:**
- None strictly (Can be built in parallel to backend), but requires Stage 4 for end-to-end testing.

**Potential Risks:**
- Memory leaks from unrevoked object URLs. (`URL.revokeObjectURL` must be used when components unmount or previews are removed).

**Validation Needed:**
- Ensure users cannot select more than 5 images via the file picker.
- Ensure visual removal of an image removes it from the internal `File[]` state array.

**Estimated Complexity:**
High

**Status:**
Pending

---

## Stage 6: Frontend API Integration & UX Enhancements

**Objective:**
Hook up the frontend form to the backend, handle `multipart/form-data` headers, and implement upload progress UI.

**Files Expected To Change:**
- `frontend/src/api/playerApi.ts`
- `frontend/src/components/players/PlayerForm.tsx`

**Reason Those Files Need Modification:**
- **playerApi.ts**: Modify `createPlayer` and `updatePlayer` to accept `FormData`. Must add `axios` configuration for `onUploadProgress` to calculate percentages. Ensure `Content-Type: multipart/form-data` is either set manually or allowed to be set automatically by Axios.
- **PlayerForm.tsx**: Wire the progress percentage to a visual progress bar. Disable the submit button (`disabled={isUploading}`) while the request is in flight.

**Dependencies:**
- Stage 4, Stage 5

**Potential Risks:**
- Axios sometimes struggles with manual `multipart/form-data` headers (it's best to let Axios set it automatically to include the boundary).

**Validation Needed:**
- End-to-End test creating a player with 1 avatar and 5 gallery images. Observe progress bar.

**Estimated Complexity:**
Medium

**Status:**
Pending

---

## Stage 7: Postman Automation & Edge Case Verification

**Objective:**
Create robust Postman collections handling multipart form data to automate the testing of edge cases.

**Files Expected To Change:**
- Postman Collection (Exported to `backend/postman/`)

**Reason Those Files Need Modification:**
- Must configure Postman requests to use `form-data` body types. 
- Must construct specific test cases to explicitly hit every requirement and edge case.

**Dependencies:**
- Stage 1-4

**Potential Risks:**
- Postman file paths are relative to the local machine, making automated collection running slightly tricky for other developers unless dummy files are included in the repo.

**Validation Needed:**
Execute the following scenarios:
1. Valid upload (1 avatar, 2 gallery).
2. Missing avatar (Expect 400).
3. 6 gallery images (Expect Multer `LIMIT_UNEXPECTED_FILE`).
4. Wrong file type (e.g., `.pdf`) (Expect 400).
5. Large file (>2MB) (Expect Multer `LIMIT_FILE_SIZE`).

**Estimated Complexity:**
Low

**Status:**
Pending

---

## Implementation Order

1. **Stage 1**: Database Schema Modification (Foundation)
2. **Stage 2**: Backend Upload Infrastructure (Configuration)
3. **Stage 3**: Backend Route & Error Handling Integration (Routing)
4. **Stage 4**: Service & Controller Business Logic (Core Backend Logic)
5. **Stage 5**: Frontend Component Architecture (UI Build)
6. **Stage 6**: Frontend API Integration & UX (Connection)
7. **Stage 7**: Postman Automation (Final Verification)

## Final Verification Plan
Once all stages are complete, the following end-to-end verification must be executed:
1. Start from a fresh database state.
2. Run Postman automated tests to verify backend boundaries (Size limits, format limits, required fields).
3. Using the frontend UI, create a new player with an avatar and 3 gallery images. Observe the upload progress bar.
4. Verify the database contains the correct string paths.
5. Verify the backend `/uploads` folder physically contains the files.
6. Edit the same player in the frontend UI, providing a *new* avatar.
7. Verify the old avatar file is physically deleted from the backend `/uploads/players/avatar/` directory.
8. Validate that fetching the player list successfully serves the images to the frontend UI via static URL paths.
