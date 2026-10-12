# CALIBRATE — Complete System Explainer & Team Guide
> **Cloud Computing Capstone Project**  
> **Team Lead**: Abhijeet Senapati  
> **Project Name**: Calibrate (Cloud-Native Proof-of-Work Verification Platform)  
> **Live Production URL**: [https://main.d277ex7vkxbygh.amplifyapp.com](https://main.d277ex7vkxbygh.amplifyapp.com)  
> **GitHub Repository**: [https://github.com/abhijeet586/calibrate](https://github.com/abhijeet586/calibrate)

---

## 1. The Big Picture: What is Calibrate? (The Problem & Solution)

### The Problem in College Placements Today
- When students apply for software or cloud engineering jobs, their resumes are filled with unverified buzzwords: *"Proficient in AWS, Docker, Kubernetes, React"*.
- Recruiters have no way to verify if the student actually built real systems or just copied code.
- Traditional College Placement Cells (CDCs) have zero visibility into real-time market hiring trends.

### What Calibrate Solves
**Calibrate** bridges this gap. It replaces paper resumes with a **Cloud-Native Proof-of-Work Platform**:
1. Students select a **Target Career Track** (e.g., *Cloud Solutions Architect*).
2. The platform breaks their track down into **Milestones**.
3. Students must upload **Verifiable Deliverables** (architecture diagrams, source code, deployment evidence) directly to an **Amazon S3 Evidence Vault**.
4. Faculty Mentors inspect the proof in a private cloud viewer and **Approve or Reject** the work.
5. The student’s **Live Skill Gap Radar** dynamically updates with verified skills.

---

## 2. The 3 User Personas: Who Uses What?

```
+---------------------------------------------------------------------------------+
|                                 CALIBRATE ROLES                                 |
+------------------------+--------------------------------+-----------------------+
| 👨‍🎓 Student             | 👩‍🏫 Mentor                      | 🏛️ CDC Admin           |
| (student@calibrate.edu)| (mentor@calibrate.edu)         | (admin@calibrate.edu) |
+------------------------+--------------------------------+-----------------------+
| • Chooses Career Track | • Reviews verification queue   | • Tracks batch metrics|
| • Views dynamic roadmap| • Inspects S3 deliverables     | • Broadcasts alerts   |
| • Uploads proof to S3  | • Approves / Rejects proof     | • Views AWS CloudWatch|
| • Sees Skill Gap Radar | • Provides feedback to student |   & SNS telemetry live|
+------------------------+--------------------------------+-----------------------+
```

---

## 3. How the Cloud Architecture Actually Works

Here is the high-level architecture diagram your team can draw on a whiteboard:

```
                          [ BROWSER: Student / Mentor ]
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
         HTTPS (Web Traffic)                      Direct S3 Upload (PUT)
                    │                                     │
                    ▼                                     ▼
        ┌───────────────────────┐             ┌───────────────────────┐
        │ AWS Amplify (Hosting) │             │ Amazon S3 Bucket      │
        │ - CloudFront Edge CDN │             │ - calibrate-evidence- │
        │ - Next.js 16 SSR      │             │   vault (Sydney)      │
        └───────────┬───────────┘             │ - Block Public Access │
                    │                         └───────────▲───────────┘
                    ├─────────────────────────────────────┘
                    │  (Server-Side Stream via IAM /api/evidence/view)
                    │
                    ├──► [ Supabase Cloud Database ] (PostgreSQL + RLS)
                    │
                    ├──► [ Amazon CloudWatch ] (Log Group: /calibrate/evidence-audit)
                    │
                    └──► [ Amazon SNS ] (Topic: calibrate-mentor-alerts)
```

---

## 4. Deep-Dive into the AWS Cloud Components

Explain each of these to your professor or teammate using this simple analogy:

### A. AWS Amplify Hosting (The Server & Deployment)
- **What it is**: Serverless web application hosting backed by Amazon CloudFront CDN.
- **Why we used it**: Instead of manually setting up an EC2 virtual machine, installing Node.js, and managing NGINX, Amplify connects directly to our GitHub repository.
- **The CI/CD Magic**: Every time someone runs `git push origin main`, AWS Amplify spins up an automated build container, compiles our Next.js 16 code, runs type checks, and deploys globally with **zero downtime**.

### B. Amazon S3 Evidence Vault & Presigned URLs (The Storage)
- **What it is**: High-durability object storage in the `ap-southeast-2` (Sydney) region named `calibrate-evidence-vault`.
- **The Core Problem with Normal Uploads**:
  - In traditional web apps, the user uploads a 50MB file to the *web server*, and the server forwards it to storage.
  - If 50 students upload files at the same time during a placement exam, the web server runs out of memory and crashes!
- **How Calibrate Solves It (Presigned PUT Pattern)**:
  1. The student’s browser asks our server: *"I want to upload Tourism.pdf, give me permission."*
  2. Our server uses AWS IAM keys to generate a **Presigned PUT URL** (valid for only 15 minutes).
  3. The browser sends the file **directly to Amazon S3**.
  4. The web server uses **0 bytes of upload bandwidth**, ensuring infinite scalability.

### C. Zero-Trust Private S3 Streaming (Security)
- **What it is**: Our S3 bucket has **100% Block Public Access** enabled.
- **Why this matters**: In enterprise cloud security, student deliverables and confidential exam submissions must **never** be public to anonymous internet users.
- **How Mentors view the files**:
  - When a mentor clicks *"Open AWS S3 Deliverable"*, it routes to `/api/evidence/view?url=...`.
  - Our backend uses internal IAM permissions (`s3:GetObject`) to fetch the file from S3 server-to-server and streams it directly to the mentor's browser as a PDF or image.
  - S3 stays 100% private, yet mentors can view deliverables seamlessly with `200 OK`.

### D. Amazon SNS — Simple Notification Service (Decoupled Alerts)
- **What it is**: Cloud Pub/Sub (Publisher/Subscriber) messaging topic named `calibrate-mentor-alerts`.
- **How it works**: When a student submits new evidence, an event is published to Amazon SNS. Mentors or downstream automated evaluation workers are notified asynchronously.
- **Cloud Concept**: Decoupled, event-driven architecture.

### E. Amazon CloudWatch Logs (Observability & Audit Trail)
- **What it is**: Centralized cloud logging service under Log Group `/calibrate/evidence-audit`.
- **How it works**: Every time a presigned URL is requested or evidence is submitted, Calibrate emits a structured JSON audit event (`logCloudWatchEvent`).
- **Live UI**: Admins can view this live stream directly inside Calibrate at `/admin`.

---

## 5. End-to-End Walkthrough: What Happens Step-by-Step

Here is the exact journey of a student submission:

```
[ Step 1: Student ]
Student Abhijeet clicks "Submit Claim" on milestone:
"Deploy Multi-Tier AWS Architecture with VPC, Subnets, and S3 Evidence Vault".
        │
        ▼
[ Step 2: Presigned Token ]
Browser calls Next.js Server Action -> AWS SDK generates presigned PUT URL.
CloudWatch logs event: "PRESIGNED_URL_GENERATED".
        │
        ▼
[ Step 3: Direct S3 Upload ]
Browser sends HTTP PUT directly to Amazon S3 (Sydney). S3 returns 200 OK.
File stored at: evidence/<student_id>/<timestamp>-Tourism.pdf.
        │
        ▼
[ Step 4: Submission & Pub/Sub ]
Browser records submission in database (`evidence_submissions`).
Amazon SNS fires: "[Calibrate] New Proof Deliverable: Deploy Multi-Tier AWS...".
CloudWatch logs event: "EVIDENCE_SUBMITTED".
        │
        ▼
[ Step 5: Mentor Review ]
Faculty Mentor logs in at `/mentor/verify`.
Submission appears with badge "AWS S3 Verified Artifact".
        │
        ▼
[ Step 6: Secure Inspection ]
Mentor clicks "Open AWS S3 Deliverable".
`/api/evidence/view` fetches private S3 object and streams PDF to browser.
        │
        ▼
[ Step 7: Approval & Score Update ]
Mentor clicks "Approve". Milestone is marked "verified".
Student’s Skill Gap Radar dynamically recalculates to 100% on that skill.
```

---

## 6. How Your Team Can Divide and Present to the Professor

When presenting with your friends, divide the presentation into 3 logical parts:

| Speaker | Role | What to Show on Screen | What to Say |
|---|---|---|---|
| **Speaker 1 (Team Lead / Abhijeet)** | **System Overview & Architecture** | Open Landing Page & Architecture Diagram | *"We built Calibrate, a cloud-native proof-of-work platform hosted live on AWS Amplify with CloudFront edge distribution. We implemented serverless CI/CD, Amazon S3, SNS, and CloudWatch."* |
| **Speaker 2** | **Student Experience & S3 Upload** | Open `/student/roadmap`, open DevTools Network tab (`F12`), upload file | *"Notice the Direct-to-S3 upload pattern. The file bypasses the web server entirely and streams directly to our private S3 bucket using an IAM presigned PUT URL, saving server memory and bandwidth."* |
| **Speaker 3** | **Mentor Security & Cloud Telemetry** | Open `/mentor/verify` to view deliverable, then open `/admin` to show live CloudWatch feed | *"Our S3 bucket is private under Zero-Trust principles. Mentors inspect files via our authenticated streaming proxy. On the Admin dashboard, you can see live CloudWatch audit logs and Amazon SNS alerts in real time."* |

---

## 7. Quick Glossary of Cloud Terms for Your Friends

- **Serverless**: Running code without managing virtual machines or operating systems (AWS Amplify & S3).
- **CI/CD**: Continuous Integration / Continuous Deployment. Pushing code to GitHub automatically builds and deploys to AWS.
- **Presigned URL**: A cryptographic temporary ticket that lets a browser upload or download directly from S3 without exposing AWS secret keys.
- **Zero-Trust**: Never trust, always verify. S3 bucket blocks all public internet access by default.
- **Telemetry / Observability**: Emitting structured logs and metrics (CloudWatch) so operators can track system health and security events.
- **Pub/Sub**: Publish/Subscribe messaging (Amazon SNS) where one event notifies multiple subscribers asynchronously.
