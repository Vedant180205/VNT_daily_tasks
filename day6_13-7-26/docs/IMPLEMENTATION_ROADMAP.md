# Implementation Roadmap: Background Jobs + Queue (BullMQ + Redis)

This document breaks down the implementation of the CSV Upload and Background Player Creation task into logical, independently testable stages for the Player Management System.

---

## Stage 1: Dependencies & Infrastructure Setup

**Objective:**
Install necessary packages and ensure Redis connection is ready for BullMQ.

**Tasks:**
- Run `npm install bullmq ioredis csv-parser multer` (if not already installed).
- Verify Redis is running locally and accessible via `.env` configuration.

**Estimated Complexity:** Low
**Status:** Pending

---

## Stage 2: Queue & Worker Architecture

**Objective:**
Set up BullMQ queues and workers to handle background jobs.

**Tasks:**
- Create `backend/src/queues/playerQueue.js` to instantiate the BullMQ queue (`queue.add(...)`).
- Create `backend/src/workers/playerWorker.js` to process jobs.
- Configure the worker to handle the `create-player` job.
- Ensure the worker is initialized when the backend server starts (e.g., imported in `server.js` or `app.js`).

**Estimated Complexity:** Medium
**Status:** Pending

---

## Stage 3: CSV Upload API & Parsing

**Objective:**
Create the endpoint to receive CSV files and parse them into JSON arrays.

**Tasks:**
- Configure `multer` for memory or disk storage specifically for CSV files (e.g., `upload.single('file')`).
- Create `POST /api/players/upload-csv` in `playerRoutes.js`.
- Create a utility or service function to parse the uploaded CSV file using `csv-parser` or `fast-csv`.

**Estimated Complexity:** Medium
**Status:** Pending

---

## Stage 4: Job Dispatching

**Objective:**
Iterate over the parsed CSV data and dispatch jobs to the queue.

**Tasks:**
- In the `upload-csv` controller/service, map each parsed row to a structured job payload.
- Call `playerQueue.add('create-player', rowData)` for each row.
- Immediately return a success JSON response (`{ success: true, message: "..." }`) back to the client while jobs are queued.

**Estimated Complexity:** Low
**Status:** Pending

---

## Stage 5: Worker Business Logic & Database Insertion

**Objective:**
The worker needs to validate incoming data and insert valid records into the database.

**Tasks:**
- In `playerWorker.js`, process each `create-player` job.
- Validate the job data (e.g., check for missing fields, valid `team_id`, duplicate email).
- Use `playerModel.js` to check for duplicates and insert new players into the database.
- Throw an error inside the worker if validation fails to trigger the retry mechanism.

**Estimated Complexity:** High
**Status:** Pending

---

## Stage 6: Reliability, Logging & Status Tracking

**Objective:**
Ensure jobs handle failures gracefully and execution is observable.

**Tasks:**
- Configure BullMQ retry options (e.g., 3 retries).
- Add BullMQ event listeners on the queue/worker (`completed`, `failed`) to log job outcomes.
- (Optional) Build an API endpoint to fetch job status counts using BullMQ's queue metrics.

**Estimated Complexity:** Medium
**Status:** Pending

---

## Stage 7: Automation & Verification

**Objective:**
Test the entire flow using Postman and sample CSV files.

**Tasks:**
- Create a sample CSV with valid, invalid, and duplicate rows.
- Upload via Postman.
- Monitor backend logs to verify worker picks up jobs, retries failed ones, and successfully processes valid ones.
- Check the database to confirm players were created.

**Estimated Complexity:** Low
**Status:** Pending
