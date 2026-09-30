---
week: 7
title: "Weekly Progress Log - Week 7 (Command-Line Incident Response, DeepBlueCLI & BTL1 Exam Pass)"
startDate: "21st September 2026"
summary: "Studied Windows command-line and PowerShell incident response workflows, practiced DeepBlueCLI event log analysis, and took and passed the Blue Team Level 1 (BTL1) practical exam ahead of schedule."
date: 2026-09-21
---

### **Week Starting:** 21st September 2026

## What I worked on

#### Windows Incident Response via CLI & PowerShell
- **Command-Line Triage:** Practiced native Windows command-line tools (`net`, `tasklist`, `wmic`, `sc`, `netstat`) for rapid host triage, service verification, active network connection inspection, and rogue process discovery.
- **PowerShell for IR:** Utilized PowerShell cmdlets (`Get-Process`, `Get-Service`, `Get-WinEvent`) to inspect running processes, analyze system startup entries, and query specific event log IDs directly from the terminal without relying on GUI viewers.
- **DeepBlueCLI Event Log Forensics:** Applied **DeepBlueCLI** to automate parsing and rapid detection across large Windows EVTX event logs, quickly identifying suspicious process execution patterns, service installations, and command-line obfuscation.

#### Blue Team Level 1 (BTL1) Certification Exam
- **Exam Completion:** Took and successfully passed the **Blue Team Level 1 (BTL1)** practical certification exam, finishing a week ahead of schedule.
- **Practical SOC Assessment:** Applied hands-on skills across all five core domains tested during the 24-hour practical exam: Phishing Analysis, Cyber Threat Intelligence (CTI), Digital Forensics (disk and memory triage), SIEM (Splunk) investigation, and Incident Response handling.

## Key Takeaways

After completing the exam and reflecting on the preparation journey, the most important lesson was the vital necessity of having a structured **investigative methodology**.

Effective defense and SOC triage require:
1. Understanding the scope and objective of the task at hand.
2. Knowing precisely what indicators to search for.
3. Identifying the right data sources and telemetry logs needed for the investigation.
4. Knowing where to locate specific artifacts across network, endpoint, and memory sources.
5. Correlating multiple Indicators of Compromise (IoCs) across time to reconstruct the complete attack narrative.

While security tools and automated parsers are useful, understanding the underlying reasoning and analytical logic behind every query and artifact is what truly drives accurate incident response.

## Challenges and Friction

Fully locking in to prepare for and complete the intensive 24-hour practical BTL1 exam was mentally demanding. Handling prolonged focus during the forensic investigation resulted in fatigue, so I prioritized rest and recovery for the remainder of the week.

## Looking Ahead
### Week 8
- Begin the Incident Handling Process module on Hack The Box
- Work through active HTB target boxes to practice hands-on analytical workflows
- Draft a detailed write-up reflecting on the overall BTL1 exam experience and methodology
