##DESIGN & IMPLEMENTATION: Online Assignment Submission Management System

Stack

Backend: Node.js + Express

Database: MongoDB (Mongoose)

Frontend: EJS (server-side rendered)

File storage: Cloudinary (images, PDFs, DOC/DOCX)

Authentication: passport-local (bcrypt for password hashing)

Email: nodemailer (SMTP) or a transactional email provider (SendGrid, Mailgun)

File upload middleware: multer + multer-storage-cloudinary

Session store: connect-mongo

Project goals / requirements (from your brief)

First user who registers becomes admin (examiner).

Students register with fields: Student name, Registration No, Email, Phone No, Department, Year, Semester.

After login, student uploads assignment(s) (image, PDF, DOC/DOCX) via dashboard.

When a student submits, admin receives an email notification with submission details and link to view in admin dashboard.

Admin can view the submission, grade it, and on grading the student receives an email telling them the assignment was graded and to view score.

Students can submit multiple assignments (per course or per assignment slot).

Cloudinary used for file storage.

Build for National Diploma Computer Science (deliverable: working app + documentation + slides).
