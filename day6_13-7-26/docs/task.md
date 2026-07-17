# Day 7: Background Jobs + Queue (BullMQ + Redis)

🚀 NEXT TASK – BACKGROUND JOBS + QUEUE (BULLMQ + REDIS)

🔥 STEP 1 – INSTALL REDIS (WINDOWS)
(Redis is already running locally)

🔥 STEP 2 – INSTALL BULLMQ
`npm install bullmq ioredis`

🔥 STEP 3 – CREATE QUEUE SETUP
Create:
- `queues/playerQueue.js`
- `workers/playerWorker.js`

🔥 TASK – CSV UPLOAD → BACKGROUND PLAYER CREATION
📌 API TO BUILD
- `POST /api/players/upload-csv`

📥 INPUT
Upload CSV file:
Columns:
- name
- email
- phone
- team_id 

⚙️ FLOW
1. User uploads CSV
2. Backend parses CSV
3. For each row:
👉 Add job to queue
`queue.add('create-player', rowData)`

⚡ WORKER (IMPORTANT)
Worker will:
- Read job
- Validate data
- Insert into DB

🔥 JOB STRUCTURE
```json
{
  "name": "Rahul",
  "email": "rahul@gmail.com",
  "phone": "9876543210",
  "team_id": 1
}
```

⚠️ VALIDATION IN WORKER
Handle:
- Duplicate email
- Invalid data
- Missing fields 

🔥 RESPONSE (API)
Immediately return:
```json
{
  "success": true,
  "message": "CSV uploaded. Players are being created in background"
}
```

🔥 ADD JOB STATUS TRACKING (IMPORTANT)
Optional but recommended:
- Track total jobs
- Success count
- Failed count

🔥 TASK 4 – LOGGING
Log:
- Job started
- Job success
- Job failed

🔥 TASK 5 – HANDLE FAILURES
If job fails:
- Retry 3 times
- Log error

🔥 REAL-WORLD PROBLEMS TO HANDLE
- Large CSV (1000+ rows)
- Duplicate entries 
- Partial failure
- Server crash mid-processing

📂 EXPECTED STRUCTURE
backend/
  queues/
  workers/
  uploads/
  controllers/

📤 SUBMIT
- Working queue system
- CSV upload working
- Background jobs running
- Logs showing job execution