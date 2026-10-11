# CALIBRATE: Cloud Computing Capstone Project Walkthrough
**Student Name**: Abhijeet Senapati  
**Platform**: Calibrate — Cloud-Native Proof-of-Work Verification Platform  
**Live Production URL**: [https://main.d277ex7vkxbygh.amplifyapp.com](https://main.d277ex7vkxbygh.amplifyapp.com)  
**GitHub Repository**: [https://github.com/abhijeet586/calibrate](https://github.com/abhijeet586/calibrate)  

---

## 1. Executive Summary & Cloud Architecture

Calibrate is an enterprise-grade, cloud-native educational platform designed to solve the college placement "proof-of-work gap". Instead of relying on static, unverified resumes, Calibrate facilitates curriculum tracking, direct-to-cloud artifact uploads, mentor evaluation, and automated telemetry.

### Cloud Architecture Highlights:
```
                                  +---------------------------+
                                  |   Student & Mentor Client  |
                                  +-------------+-------------+
                                                |
                              HTTPS (TLS 1.3)   |  Direct Presigned PUT
                                                v
    +------------------------------------+      |
    |      AWS CloudFront CDN / Edge     |      |
    +-----------------+------------------+      |
                      |                         |
                      v                         |
    +-----------------+------------------+      |
    |     AWS Amplify Hosting (SSR)      |      |
    |  - Next.js 16 App Router Server   |      |
    |  - Server Actions & Edge Routes    |      |
    +--------+------------------+--------+      |
             |                  |               |
             | Server-side S3   | API Requests  |
             | Streaming (IAM)  v               |
             |      +-----------+----------+    |
             |      |  Supabase Cloud DB   |    |
             |      |  - Postgres with RLS |    |
             |      +----------------------+    |
             v                                  v
    +--------+----------------------------------+--------+
    |                   Amazon Web Services              |
    |                                                    |
    |   +-----------------------+   +----------------+   |
    |   | Amazon S3 Bucket      |<--+ Direct Upload  |   |
    |   | (calibrate-evidence-  |   | (Presigned URL)|   |
    |   |  vault in ap-se-2)    |   +----------------+   |
    |   +-----------+-----------+                        |
    |               |                                    |
    |   +-----------v-----------+   +----------------+   |
    |   | Amazon CloudWatch     |   | Amazon SNS     |   |
    |   | - Structured Audit    |   | - Mentor Alert |   |
    |   |   Telemetry Logs      |   |   Pub/Sub      |   |
    |   +-----------------------+   +----------------+   |
    +----------------------------------------------------+
```

---

## 2. The 6 Cloud Computing Features to Highlight

| # | Cloud Feature | Service / Technology | Implementation in Calibrate | Why It Matters to Professors |
|---|---------------|----------------------|------------------------------|-------------------------------|
| **1** | **Serverless Edge Deployment & CI/CD** | AWS Amplify Hosting + GitHub | Automated git push triggers build, SSR bundle generation, and deployment across CloudFront edge locations. | Demonstrates Continuous Integration / Continuous Deployment (CI/CD) and serverless web compute. |
| **2** | **Direct-to-Cloud Presigned Uploads** | Amazon S3 + AWS SDK v3 | Browser requests temporary IAM-signed PUT URL and uploads files directly to S3 without bottlenecking the application server. | Solves traditional server bandwidth saturation and file size limits (Zero-Server-Load upload architecture). |
| **3** | **Zero-Trust Private Vault Security** | Amazon S3 Public Access Block + IAM | Bucket has 100% public access blocked. Deliverables are fetched server-to-server with IAM credentials and streamed via Next.js route handler (`/api/evidence/view`). | Proves understanding of Principle of Least Privilege and enterprise data protection standards. |
| **4** | **Decoupled Event Notification** | Amazon SNS (Simple Notification Service) | Pub/Sub messaging dispatches notification events when students submit proof-of-work, alerting mentors asynchronously. | Demonstrates loose coupling and event-driven cloud architecture. |
| **5** | **Cloud Audit & Telemetry Logging** | Amazon CloudWatch Logs | Structured JSON logging of every evidence generation and submission event (`logCloudWatchEvent`). | Illustrates Observability, operational audit trails, and compliance. |
| **6** | **Cloud-Native RBAC & Security** | PostgreSQL Row-Level Security (RLS) | Multi-tenant role-based access control protecting student and mentor data directly at the database engine level. | Demonstrates defense-in-depth security beyond client-side routing. |

---

## 3. Professor Presentation Walkthrough Script (5–7 Minutes)

### Step 1: Introduction & Architecture Overview (1 Minute)
> *"Good morning Professor. Today I am presenting **Calibrate**, an enterprise cloud-native proof-of-work verification system. The platform is architected around serverless cloud principles: high availability, automated scalability, least-privilege security, and decoupled telemetry.*
>
> *Our infrastructure is hosted live on **AWS Amplify** with edge caching, backed by **Amazon S3** for evidence vaulting, **Amazon SNS** for asynchronous alerts, and **Amazon CloudWatch** for audit logging."*

### Step 2: Show the Live Production URL & CI/CD Pipeline (1 Minute)
1. Open the browser to **`https://main.d277ex7vkxbygh.amplifyapp.com`**.
2. **What to say**:
   > *"As you can see, the application is not running on localhost — it is live in production on AWS Amplify under a custom CloudFront distribution. Every git commit to our repository triggers an automated build pipeline that runs TypeScript validation, generates production serverless SSR artifacts, and deploys globally with zero downtime."*

### Step 3: Student Persona — Direct S3 Presigned Upload (2 Minutes)
1. Log in as a student (`student@calibrate.edu` / `student123`).
2. Navigate to **"My Roadmap"** (`/student/roadmap`).
3. Point out the **Cloud Solutions Architect** curriculum milestone:
   - *Deploy Multi-Tier AWS Architecture with VPC, Subnets, and S3 Evidence Vault*
4. Click **"Submit Claim"** or **"Start"**.
5. Select the **"AWS S3 Upload"** tab.
6. Choose a sample PDF, PNG, or project deliverable (e.g., `Architecture_Diagram.pdf`).
7. Open the browser DevTools (`F12` -> **Network** tab) to show the professor the cloud communication:
   - Point out the server action call to `requestEvidenceUploadUrl`.
   - Point out the direct HTTP `PUT` request to `https://calibrate-evidence-vault.s3.ap-southeast-2.amazonaws.com/...`.
8. **What to say**:
   > *"Professor, please observe this network trace. Traditional web applications upload files to the web server, which exhausts server RAM and bandwidth. In Calibrate, we use a cloud-native **Direct-to-S3 Presigned Upload pattern**.*
   >
   > *Our server uses AWS IAM credentials to generate a temporary, cryptographically signed S3 PUT URL valid for 15 minutes. The browser streams the file directly to the S3 bucket in `ap-southeast-2`. The web application server never touches the raw bytes."*

### Step 4: Mentor Persona — Secure S3 Streaming & Verification (2 Minutes)
1. Open an Incognito window or log out and log in as mentor (`mentor@calibrate.edu` / `mentor123`).
2. Go to **"Verify Skills"** (`/mentor/verify`) or **"Dashboard"** (`/mentor`).
3. Show the professor the pending verification item from student Abhijeet Senapati with the **"AWS S3 Verified Artifact"** badge.
4. Click **"Open AWS S3 Deliverable (Signed Viewer)"**.
5. The PDF or deliverable opens immediately in a new tab with `200 OK`.
6. **What to say**:
   > *"Here is how we address cloud security. Our S3 bucket has **Block Public Access** fully enabled, meaning anonymous internet users cannot access students' deliverables. Instead of making the bucket public, our backend implements a secure server-side streaming route at `/api/evidence/view`.*
   >
   > *It validates the session, retrieves the object securely from S3 using IAM credentials, and streams it with proper HTTP headers (`Content-Type: application/pdf` and `Content-Disposition: inline`). This enforces zero-trust data protection."*
7. Click **"Approve"** on the submission.
8. Switch back to the student view (`/student/progress`) and demonstrate that the skill score and Radar chart dynamically updated.

### Step 5: Market Pulse & CDC Intelligence (1 Minute)
1. Navigate to **"Market Feed"** (`/student/feed`).
2. Demonstrate category filtering: **Frontend**, **Backend**, **AI**, **Cloud**, **General**.
3. **What to say**:
   > *"The Market Pulse engine correlates real-time industry hiring signals with student curriculum tracks, ensuring students develop competencies that match current cloud job demand."*

---

## 4. Tough Questions Professors Ask (And Your Answers)

### Q1: *"Why did you use S3 presigned URLs instead of uploading through a Next.js API route?"*
**Your Answer**:
> *"Uploading files through an API route causes memory spikes and limits concurrent file transfers because the server must buffer chunks before forwarding. In high-concurrency campus recruitment drives, dozens of students submitting 50MB architecture deliverables would crash a standard container.*
>
> *With S3 presigned URLs, AWS handles the bandwidth, scaling, multipart chunking, and storage directly. Our compute server only generates a 200-byte signature, giving us virtually unlimited upload concurrency at near-zero server cost."*

### Q2: *"How do you ensure someone cannot upload malicious files or overwrite other students' deliverables in S3?"*
**Your Answer**:
> *"We enforce two layers of security:
> 1. **Scoped Object Keys**: The object key is generated server-side using the authenticated user's unique UUID (`evidence/${studentId}/${timestamp}-${cleanFileName}`). A student cannot specify their own target key.
> 2. **Short Expiration & Strict Content Type**: The presigned URL expires in 15 minutes and is cryptographically tied to the exact MIME type (`ContentType`) requested."*

### Q3: *"How does your application achieve Continuous Integration and Continuous Deployment (CI/CD)?"*
**Your Answer**:
> *"Our project is linked via webhooks from GitHub directly to AWS Amplify Hosting. When code is pushed to `main`, Amplify triggers a containerized build container that executes our `amplify.yml` pipeline: installing npm dependencies, generating production Next.js 16 SSR bundles, optimizing assets, and deploying to CloudFront globally without manual server administration."*

### Q4: *"What is the difference between your S3 bucket security and typical public static websites?"*
**Your Answer**:
> *"Static websites use public S3 buckets with `s3:GetObject` allowed to `*` (everyone). In Calibrate, our bucket has all four Public Access Block settings turned on. No object is ever public. Mentors access deliverables either via short-lived 1-hour presigned GET URLs or through our authenticated server-side streaming proxy."*
