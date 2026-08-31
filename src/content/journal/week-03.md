---
week: 3
title: "Weekly Progress Log - Week 3 (Digital Forensics & Evidence Handling)"
startDate: "24th August 2026"
summary: "Started BTL1 Digital Forensics module, studied forensic data representation, order of volatility, file systems (NTFS/EXT4), and metadata carving with ExifTool and Scalpel."
date: 2026-08-24
---

### **Week Starting:** 24th August 2026

## What I worked on

#### Blue Team Level One Prep — Digital Forensics
- **Digital Forensic Process & Fundamentals:** Explored the end-to-end digital forensic methodology, forensic readiness, and data representation across multiple formats (Binary, Hexadecimal, Base64, Octal, ASCII).
- **Storage & File Systems:** Studied HDD and SSD storage architectures alongside Windows and Linux file systems (NTFS, FAT32, EXT3/EXT4).
- **Digital Evidence & Order of Volatility:** Reviewed the identification, acquisition, and handling of digital evidence strictly preserving chain of custody and the Order of Volatility (from CPU cache/registers and RAM to network state, disk storage, and archival backups).
- **Metadata & File Carving:** Practiced metadata inspection and raw header/footer carving using forensic utilities including `exiftool` and `scalpel`.

## Key Takeaways

Digital forensics demands rigorous, meticulous attention to detail. You can have all the advanced forensic tooling in the world, but if you do not understand what specific artifacts you are looking for and why, you will waste critical investigation time.

The **Order of Volatility** of digital evidence is paramount in any incident response or forensic triage workflow. Prioritizing volatile memory artifacts before static storage ensures non-persistent evidence is captured before power-down or system modification.

All digital assets contain embedded metadata that yields vital timeline and attribution intelligence. Above all, **data integrity** (via cryptographic hashing and strict read-only write-blocking) must be preserved at all stages of evidence handling.

## Challenges and Friction

Encountered a heavy volume of foundational theory this week, leaving limited time for practical Hack The Box challenge boxes.

Navigating the distinct operational roles of new tools required adjustments: initially mixing up `scalpel` (used for signature-based file carving from raw disks/images) and `exiftool` (used for parsing and reading metadata attributes). Differentiating their respective use-cases in the forensic pipeline is now clear.

## Looking Ahead
### Week 4
- Complete the remainder of the Digital Forensics module
- Tackle 6 practical boxes / sherlocks on Hack The Box to catch up on hands-on triage practice
