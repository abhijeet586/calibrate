# CALIBRATE — AWS Console Showcase & Demo Guide
> **Dual-Screen Professor Demonstration Script**  
> **Platform**: Calibrate — Cloud-Native Proof-of-Work Platform  
> **AWS Account Region**: `ap-southeast-2` (Sydney)  
> **Live App**: [https://main.d277ex7vkxbygh.amplifyapp.com](https://main.d277ex7vkxbygh.amplifyapp.com)  

---

## 🖥️ Browser Tab Setup Before the Presentation

Open these **6 tabs** in your browser before your professor calls your team:

| Tab # | Title / URL | What It Shows |
|---|---|---|
| **Tab 1** | **Calibrate Live Application** (`https://main.d277ex7vkxbygh.amplifyapp.com`) | Student, Mentor, and Admin workflows |
| **Tab 2** | **AWS Console — Amazon S3** (`s3.console.aws.amazon.com`) | `calibrate-evidence-vault` bucket (Objects & Security) |
| **Tab 3** | **AWS Console — AWS Amplify** (`console.aws.amazon.com/amplify`) | CI/CD build pipeline & CloudFront edge deployment |
| **Tab 4** | **AWS Console — Amazon CloudWatch** (`console.aws.amazon.com/cloudwatch`) | Log Groups & structured audit telemetry stream |
| **Tab 5** | **AWS Console — Amazon SNS** (`console.aws.amazon.com/sns`) | `calibrate-mentor-alerts` topic & Pub/Sub configuration |
| **Tab 6** | **AWS Console — AWS IAM** (`console.aws.amazon.com/iam`) | Least-privilege credentials and security policies |

---

## 🎬 The 6-Minute Live Demo Script (Switching Between App & AWS Console)

### ACT 1: Production Infrastructure & CI/CD Pipeline (1 min)

1. **In Calibrate (Tab 1)**:
   - Show the landing page and say:
     > *"Professor, Calibrate is running 100% serverlessly on AWS cloud infrastructure."*
2. **Switch to AWS Amplify Console (Tab 3)**:
   - Point to the app **`Calibrate`** and branch **`main`**.
   - **Show the professor**:
     - The **4-Stage Pipeline**: *Provision → Build → Deploy → Verify* (all green checkmarks).
     - The **Last Commit**: Matches our latest GitHub commit.
     - **App Settings → Environment variables**: Show cloud environment variables (`APP_AWS_REGION`, `APP_AWS_S3_BUCKET_NAME`, etc.).
   - **What to say**:
     > *"We implemented automated CI/CD. Every code push to our GitHub repository triggers containerized Next.js 16 SSR builds and deploys to AWS CloudFront edge locations globally without any manual server maintenance."*

---

### ACT 2: The Direct-to-S3 Upload & Live Bucket Inspection (2 mins)
*(This is the most impressive cloud feature — make sure to show it!)*

1. **In Calibrate (Tab 1)**:
   - Log in as student (`student@calibrate.edu` / `student123`).
   - Open **"My Roadmap"** (`/student/roadmap`).
   - Click **"Submit Claim"** on *Deploy Multi-Tier AWS Architecture with VPC, Subnets, and S3 Evidence Vault*.
   - Open browser DevTools (`F12` → **Network** tab).
   - Select a deliverable file (e.g. `Tourism.pdf` or an architecture diagram).
   - Click **"Upload to S3 & Submit"**.
   - Point out the network calls:
     1. Fast server action request for the presigned URL.
     2. Direct HTTP `PUT` streaming directly to `https://calibrate-evidence-vault.s3.ap-southeast-2.amazonaws.com/...`.
2. **Switch to Amazon S3 Console (Tab 2)**:
   - Open the bucket **`calibrate-evidence-vault`**.
   - Click into the **`evidence/`** folder → Click the student UUID folder.
   - Hit **Refresh** in the S3 console!
   - **Boom! The file you just uploaded is sitting right there in Amazon S3!**
   - Click on the file:
     - Show the **Key**: `evidence/<student_id>/<timestamp>-<filename>`.
     - Show the **Size**: (e.g. `176.2 KB`).
     - Show the **Storage Class**: `Standard`.
     - Show the **Metadata**: `uploaded-by`, `platform: calibrate-cloud`.
   - **What to say**:
     > *"Professor, notice that the file was never uploaded through our web server. Our application generated an IAM-signed presigned PUT URL, and the browser streamed the file directly into this S3 bucket. This eliminates server bandwidth bottlenecks and allows infinite upload scaling."*

---

### ACT 3: Zero-Trust Security & Block Public Access (1.5 mins)

1. **In Amazon S3 Console (Tab 2)**:
   - Click on the **Permissions** tab of the `calibrate-evidence-vault` bucket.
   - Show the yellow box: **Block public access (bucket settings) — ON**.
     - *BlockPublicAcls: True*
     - *IgnorePublicAcls: True*
     - *BlockPublicPolicy: True*
     - *RestrictPublicBuckets: True*
   - Scroll down and show the **CORS configuration**:
     ```json
     [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
         "AllowedOrigins": ["http://localhost:3000", "https://*"],
         "ExposeHeaders": ["ETag"]
       }
     ]
     ```
   - **What to say**:
     > *"From an enterprise security standpoint, an Evidence Vault holding student exam and placement deliverables must never be publicly accessible. All public access is 100% blocked.*
     > *If an anonymous user tries to fetch the raw S3 URL, AWS immediately returns `AccessDenied`."*

2. **Switch to Calibrate (Tab 1) — Mentor Review**:
   - Log in as mentor (`mentor@calibrate.edu` / `mentor123`).
   - Go to **"Verify Skills"** (`/mentor/verify`).
   - Point out the **"AWS S3 Verified Artifact"** badge.
   - Click **"Open AWS S3 Deliverable (Signed Viewer)"**.
   - The file opens immediately in the browser with `200 OK`!
   - **What to say**:
     > *"To allow mentors to inspect private deliverables without exposing the S3 bucket to the internet, we built an authenticated streaming route at `/api/evidence/view`. Our backend uses IAM credentials server-to-server to fetch the object from S3 and stream it with proper headers (`Content-Type: application/pdf`, `Content-Disposition: inline`)."*
   - Click **"Approve"**.

---

### ACT 4: CloudWatch Audit Logs & SNS Pub/Sub Alerts (1.5 mins)

1. **In Calibrate (Tab 1)**:
   - Log in as admin (`admin@calibrate.edu` / `admin123`) at `/admin`.
   - Show the **AWS Cloud Telemetry & Observability** monitor right on the dashboard.
   - Point to the live event entries:
     - `EVIDENCE_SUBMITTED` (Amazon CloudWatch)
     - `SNS_ALERT_DISPATCHED` (Amazon SNS)
2. **Switch to Amazon CloudWatch Console (Tab 4)**:
   - Go to **Log Groups** → Click **`/calibrate/evidence-audit`**.
   - Open the latest log stream and expand an event to show the JSON:
     ```json
     {
       "timestamp": "2026-10-12T01:26:37.000Z",
       "event": "EVIDENCE_SUBMITTED",
       "platform": "calibrate-cloud",
       "fileName": "Tourism.pdf",
       "s3Key": "evidence/47af.../Tourism.pdf",
       "fileSizeBytes": 176210
     }
     ```
   - **What to say**:
     > *"Here is our operational telemetry. Every evidence lifecycle event is logged as structured JSON in CloudWatch for audit compliance and security monitoring."*
3. **Switch to Amazon SNS Console (Tab 5)**:
   - Go to **Topics** → Click **`calibrate-mentor-alerts`**.
   - Show the Topic ARN: `arn:aws:sns:ap-southeast-2:398021157144:calibrate-mentor-alerts`.
   - **What to say**:
     > *"We decouple notifications using Amazon SNS. When a student uploads a deliverable, an alert event is published to this topic asynchronously, alerting mentor review queues and email subscribers without blocking the student's browser response."*

---

### ACT 5: IAM Security & Infrastructure-as-Code (30 secs)

1. **Switch to AWS IAM Console (Tab 6)**:
   - Show the IAM User / Role credentials.
   - Highlight that the credentials only have permissions for `s3:PutObject`, `s3:GetObject`, `logs:PutLogEvents`, and `sns:Publish` — following the **Principle of Least Privilege**.
2. **In your VS Code IDE**:
   - Open `aws/serverless-template.yaml`.
   - Show that the entire architecture (S3 Bucket, SNS Topic, CloudWatch LogGroup, and Lambda microservice) is defined as **Infrastructure-as-Code (IaC)** using AWS CloudFormation / SAM.

---

## 🎯 Summary Checklist to Run Through Before Calling the Professor

- [ ] All 6 browser tabs opened and logged in.
- [ ] Sample PDF deliverable ready on Desktop (e.g. `Tourism.pdf` or `Cloud_Architecture.pdf`).
- [ ] DevTools Network tab opened on Calibrate.
- [ ] S3 bucket `calibrate-evidence-vault` open in Sydney (`ap-southeast-2`).
- [ ] Amplify console open on app `Calibrate` (branch `main`).
- [ ] CloudWatch LogGroup `/calibrate/evidence-audit` ready.
