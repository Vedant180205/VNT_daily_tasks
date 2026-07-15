🚀 ADVANCED FILE UPLOAD + FORM HANDLING
🔥 TASK – MULTI IMAGE + FORM SUBMISSION
build:
👉 Create Player with Full Form + Multiple Images
📌 BACKEND APIs
1. Create Player (with images)
• POST /api/players
Form-data:
• name
• email
• phone
• team_id
• avatar (single)
• gallery (multiple images)
🔥 REQUIREMENTS (IMPORTANT)
📷 FILE HANDLING
• Avatar → single image
• Gallery → multiple images (max 5)
Do NOT store images in database (no base64, no binary)
Save files in backend server:
/uploads/players/avatar/
/uploads/players/gallery/
• Store only file path in database
Example:
avatar = "/uploads/players/avatar/abc.jpg"
gallery = ["/uploads/players/gallery/img1.jpg", "/uploads/players/gallery/img2.jpg"]
Use:
👉 multer.fields()
Example:
upload.fields([
{ name: 'avatar', maxCount: 1 },
{ name: 'gallery', maxCount: 5 }
])
⚠️ VALIDATIONS (REAL-WORLD)
• Max 2MB per image
• Only jpg/png
• Reject if:
● no avatar
● more than 5 gallery images
💥 EDGE CASES (VERY IMPORTANT)
Handle these:
• User submits form without images
• User uploads 10 images
• Same file uploaded twice
🔧 FRONTEND TASK (IMPORTANT)
Build proper form:
• All input fields
• Avatar upload
• Multiple image upload
🔥 UX REQUIREMENTS
• Preview images before upload
• Remove selected images
• Show upload progress
• Disable submit while uploading
Delete old images on update
📮 POSTMAN TASK
Test scenarios:
• Valid upload
• No avatar
• Too many images
• Wrong file type
• Large file