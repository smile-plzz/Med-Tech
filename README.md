# Med-Tech: Online Doctor Consultation with OCR

An online doctor consultation platform with built-in Optical Character Recognition (OCR) for digitizing handwritten prescriptions and medical documents. Originally developed as a Senior Design Project (CSE499, North South University, Fall 2022/2023).

## Overview

Med-Tech enables patients to book and manage doctor consultations online while giving doctors a way to scan handwritten prescriptions/documents and convert them into machine-readable text via OCR. The goal is to reduce miscommunication and substandard treatment caused by illegible handwritten records, and to make doctor-patient interaction faster and safer.

## Modules

- **Admin** — manage hospital departments, users, doctors, accounts; view appointment, transaction, operation, birth, diagnosis, and death reports; manage the database.
- **Patient (User)** — view appointments, prescriptions, medications, doctor list, booking history, feedback; manage own profile.
- **Doctor** — manage patients, appointments, prescriptions, medication, and operation reports; use OCR on uploaded documents; manage own profile.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** PHP (Laravel)
- **Database:** MySQL
- **OCR / ML:** TensorFlow, Keras, deep learning (CNN-based character recognition, trained on MNIST + Kaggle A-Z datasets)
- **Dev environment:** Google Colab (OCR model), Windows 10 (web app)

## Repository Structure

```
app/                     # Next.js 14 rebuild (TypeScript, Prisma/SQLite, Tesseract.js OCR)
docs/
  research-report.txt    # Original senior design project report (source reference)
  research-rewrite.md    # WHY/HOW/WHAT mapping from the original report to this rebuild
```

## Rebuild (2026)

The active implementation lives in `app/`. It is a Next.js 14 App Router
project with:

- JWT cookie auth for Admin / Doctor / Patient roles
- Prisma + SQLite for departments, doctors, patients, appointments,
  transactions, prescriptions, and reports
- Doctor self-registration with admin approval before appearing in search
- Patient booking flow, appointment status lifecycle, feedback
- Browser-side OCR (`/ocr`) via Tesseract.js for digitizing prescriptions

See `docs/research-rewrite.md` for what changed from the original report and
why. To run it locally:

```
cd app
npm install
npx prisma migrate dev
npm run db:seed   # creates admin@medtech.dev / admin123 + starter departments
npm run dev
```

## Background

This repo picks up an earlier research/senior-design project exploring the same concept. The original final report is kept in `docs/research-report.txt` as reference material for the architecture, literature review, and requirements that informed this build.

## Status

`app/` is a working rebuild: auth, booking, doctor approval, prescriptions,
feedback, and OCR are implemented and smoke-tested end-to-end.
