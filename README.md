<img width="817" height="616" alt="스크린샷 2026-08-03 233409" src="https://github.com/user-attachments/assets/52c48d5b-a364-4a7e-b9d2-19209ff83724" />

# MathMon

MathMon is an AI-powered mathematics learning platform that transforms photos of math problems into personalized practice sets.

Using Google Gemini, the platform extracts problem information from uploaded images, generates similar practice problems, renders graphs or geometric figures when needed, and provides an interactive environment for solving and reviewing mathematics.

---

## Features

### AI Problem Generation

- Upload photos of math problems
- OCR-based problem extraction
- Automatic difficulty analysis
- AI-generated practice problem sets
- Streaming generation (SSE)
- Generate additional non-duplicated practice problems

### Interactive Learning

- Step-by-step practice workflow
- Answer reveal and self-grading
- Interactive drawing canvas
- SVG geometry rendering
- Function graph visualization
- Automatic progression between problems

### Personal Vault

- Save generated problem sets
- Organize and rename collections
- Reorder practice problems
- Cloud synchronization with Firestore

### SAM Integration

- Solve assignments shared by teachers
- Progress synchronization
- Answer and mistake tracking
- Return directly to the SAM learning platform

### Additional Features

- Progressive Web App (PWA)
- Responsive mobile-first interface
- Google authentication
- Automatic image compression
- Privacy policy and terms pages

---

## Tech Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js API Routes
- Firebase Authentication
- Cloud Firestore

### AI

- Google Gemini 2.5 Flash
- Google Gemini 2.5 Pro
- Server-Sent Events (SSE)

### Mathematics

- KaTeX
- React Markdown
- Function Plot
- AI-generated SVG geometry

---

## Architecture

- Mobile-first Progressive Web App
- Firebase Authentication
- Firestore cloud storage
- AI-powered OCR and problem generation
- Real-time streaming responses using SSE
- Shared Firebase infrastructure with SAM

---

## What I Learned

MathMon gave me practical experience building AI-assisted educational software from end to end. I learned how to integrate multimodal AI models, design streaming APIs, visualize mathematical content, and build scalable applications using Next.js and Firebase. It also strengthened my understanding of combining AI, frontend engineering, and cloud infrastructure into a complete learning platform.
