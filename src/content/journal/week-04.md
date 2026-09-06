---
week: 4
title: "Weekly Progress Log - Week 4 (Disk Imaging, Windows Event Logging & HTB Badge)"
startDate: "31st August 2026"
summary: "Mastered FTK Imager and KAPE live forensics in BTL1. Completed HTB CDSA Windows Event Logs & Finding Evil module (earned badge), started Threat Hunting with Elastic, and cleared 6 HTB Sherlocks."
date: 2026-08-31
---

### **Week Starting:** 31st August 2026

## What I worked on

#### Blue Team Level One Prep — DFIR & Live Acquisition
- **Forensic Hardware & Evidence Handling:** Studied specialized digital evidence collection equipment (Forensic laptops with distributions like CAINE and DEFT, electrostatic bags with tamper-proof seals, digital cameras, grounding wristbands, write-blockers, and sanitized blank media) alongside strict **Chain of Custody** standards.
- **Disk Acquisition with FTK Imager:** Performed raw physical and logical disk acquisitions, verifying hash integrity (MD5/SHA1).
- **Windows Artifact Analysis:** Conducted hands-on triage across critical Windows artifacts: program execution artifacts (Prefetch, Shimcache, Amcache), browser forensics (history, downloads, cache), Recycle Bin parsing (`$I` / `$R` files), and Windows Security event logs (Logon types and Event IDs).
- **Live Remote Forensics with KAPE:** Practiced rapid live-response artifact triage using Kestrel/KAPE target and module configurations on live endpoints.

#### HTB CDSA — Windows Event Logs & Finding Evil
- **Module Completion & Badge Earned:** Successfully completed the *Windows Event Logs & Finding Evil* module ([View HTB Achievement Badge](https://academy.hackthebox.com/achievement/badge/a5e23fc7-a913-11f1-82d1-bea50ffe6cb4)).
- **Log Querying & PowerShell Automation:** Mastered hands-on log analysis and filtering techniques using the `Get-WinEvent` PowerShell cmdlet with structured hashtable queries.
- **Threat & Behavior Detection:** Utilized Sysmon and Windows Event Logs to detect advanced adversary behaviors, including DLL hijacking, unmanaged PowerShell/.NET injection, and LSASS credential dumping.
- **Event Tracing for Windows (ETW):** Explored ETW architecture, providers, and sessions to uncover stealthy parent-child process anomalies and evasive execution patterns.

#### Threat Hunting & Practical Labs
- Started the *Introduction to Threat Hunting and Hunting with Elastic* module.
- Cleared the backlog of **6 Hack The Box Sherlocks** to sharpen hands-on investigation speed and methodology.

## Key Takeaways

Gained a deep, practical understanding of forensic disk acquisition using **FTK Imager** and rapid artifact extraction with **KAPE**. Knowing which specific Windows artifacts correlate to specific attacker actions (e.g. execution, persistence, file access) is critical for efficient triage.

Mastered the structure of Windows Event Logs and Sysmon channels. Filtering events using `Get-WinEvent` filter-hashtables drastically reduces noise during live triage.

Successfully knocking out 6 Sherlocks in one week significantly boosted my investigative confidence and reinforced a structured DFIR workflow.

## Challenges and Friction

Windows Event Log analysis at scale presents a steep learning curve due to the sheer volume of fields, provider schemas, and overlapping event IDs. Continuous exposure and scripted filtering are key to building muscle memory.

The BTL1 Digital Forensics module is exceptionally technical and dense, requiring careful, deliberate study over the past two weeks to ensure complete retention.

## Looking Ahead
### Week 5
- Finish the remainder of the BTL1 Digital Forensics module
- Advance through Threat Hunting and query crafting with the Elastic stack
