# Med-Tech — Research Rewrite (2026)

Source: `Med-Tech (OCR).pdf` — CSE499 Senior Design Report, North South University, Fall 2022/2023 (Ishraq, Nabid, Hossain; supervisor Dr. Shohana Rahman Deeba).

## WHY (rationale, carried forward)

- Handwritten prescriptions are frequently illegible, causing miscommunication, dispensing errors, and substandard treatment.
- Manual, paper-based hospital record-keeping (appointments, prescriptions, operation/birth/diagnosis/death reports) is slow and error-prone.
- An online consultation platform lowers the cost/friction of getting a second opinion and keeps a durable, searchable medical history for both patient and doctor.

These motivations still hold in 2026 and are the unchanged core of the rebuild.

## HOW (original approach vs. rebuild approach)

| Concern | Original (2022/23) | Rebuild (2026) | Why changed |
|---|---|---|---|
| Web stack | HTML/CSS/JS + PHP/Laravel | Next.js 14 (TypeScript, App Router) | Single-language stack, faster iteration, no separate PHP runtime needed |
| Database | MySQL | SQLite via Prisma ORM | Zero-install local dev; Prisma schema is DB-portrising to Postgres/MySQL later without app changes |
| OCR | Custom CNN (ResNet-style) trained from scratch on MNIST digits + Kaggle A-Z letters, single-character classification, Google Colab | Tesseract.js (WASM Tesseract OCR) run in-app, whole-word/line recognition | The original model only classified one pre-segmented character at a time and needed manual contour segmentation for every image (Fig. 4.7); accuracy on real prescriptions was low (23–37% per Fig. 4.8). A pretrained, actively-maintained OCR engine avoids re-deriving a weak classifier and gives line-level text out of the box. Segmentation/preprocessing ideas from the report (binarization, deskew, denoise) are kept as an optional pre-pass. |
| Dev environment | Windows 10 + XAMPP + Google Colab | Node.js, any OS | Removes the two-environment split (PHP app vs. Python notebook) that the original design required |

## WHAT (requirements carried into the rebuild)

Three roles, unchanged from §1.3 of the report:

- **Admin** — manage hospital departments, users, doctors, accounts; view appointment / transaction / operation / birth / diagnosis / death reports; manage the database.
- **Patient** — view appointments + status, prescriptions, medications, doctor list, booking history, profile, feedback per booking.
- **Doctor** — manage patient accounts, appointments, prescriptions, medication, operation reports, profile; use OCR on uploaded documents.

Core flow (from Fig. 1.1): login/register → role dispatch → patient books (search doctor → select chamber → select date/time → payment → confirm) / doctor manages chamber+schedule+patients / admin approves doctors & appointments and reviews reports.

## Gap this rebuild does not chase

The original literature review (§1.4.1) surveys CNN-based OCR generally but never benchmarks against a pretrained OCR baseline — that comparison is effectively what this rebuild performs empirically by swapping in Tesseract.js instead of training a new CNN.
