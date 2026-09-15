---
week: 5
title: "Weekly Progress Log - Week 5 (Linux Forensics, Volatility Memory Analysis & Elastic Threat Hunting)"
startDate: "7th September 2026"
summary: "Completed BTL1 DFIR (Linux artifact triage, /etc/passwd & /etc/shadow, /var/log, memory analysis with Volatility 3) and transitioned to SIEM. Completed HTB CDSA Threat Hunting with Elastic (earned badge) and investigated Stuxbot."
date: 2026-09-07
---

### **Week Starting:** 7th September 2026

## What I worked on

#### Blue Team Level One Prep — Linux Forensics & Memory Analysis
- **Linux Artifact & Host Triage:** Investigated critical Linux system files and user authentication databases, including `/etc/passwd` and `/etc/shadow` to detect unauthorized user accounts, privilege modifications, and suspicious UID/GID assignments.
- **Log and Persistence Forensics:** Explored persistence and runtime artifacts across `/var/lib` and `/var/log` (auth.log, syslog, daemon logs), alongside user-level artifacts including `.bash_history`, hidden dotfiles, and clear directory structures.
- **Steganography Analysis:** Reviewed defensive steganography concepts and detection techniques for hidden payloads in media files.
- **Memory Forensics with Volatility:** Performed practical memory dump analysis using **Volatility** and the **Volatility 3 (Workbench GUI)**, identifying anomalous process trees, hidden injected code, network sockets, and malicious handles in volatile RAM.
- **Module Completion:** Officially completed the comprehensive BTL1 Digital Forensics and Incident Response (DFIR) module and started the **Security Information and Event Management (SIEM)** section.

#### HTB CDSA — Threat Hunting with Elastic
- **Module Completion & Badge Earned:** Successfully completed the *Introduction to Threat Hunting and Hunting with Elastic* module ([View HTB Achievement Badge](https://academy.hackthebox.com/achievement/badge/76cc0ac3-ab9d-11f1-82d1-bea50ffe6cb4)).
- **Stuxbot Investigation:** Conducted an end-to-end hands-on threat hunting operation on the **Stuxbot** adversary campaign, querying and correlating multi-source log telemetry in Elastic SIEM to uncover lateral movement and persistence mechanisms.
- **Cyber Threat Intelligence (CTI) Integration:** Explored the threat hunting lifecycle, understanding how CTI feeds into hypothesis generation, risk assessments, and proactive incident response workflows.

## Key Takeaways

Developed practical competence in volatile memory analysis using **Volatility 3**, learning how to isolate rogue processes, extract unencrypted artifacts from memory images, and trace injected shellcode.

Gained a structured understanding of proactive **Threat Hunting** methodologies—moving beyond reactive alerting to hypothesis-driven hunting using Elastic Query DSL and KQL across varied enterprise log sources.

Acquired practical skills in dissecting **Cyber Threat Intelligence (CTI)** reports, mapping threat actor tactics, techniques, and procedures (TTPs) directly to detection hypotheses.

## Challenges and Friction

Mastering multiple complex analytical platforms in a single week (Volatility 3, Elastic Stack, Linux terminal triage) required intensive focus. Extending study sessions to master intricate command parameters created cognitive fatigue, highlighting the importance of paced learning and modular note-taking.

## Looking Ahead
### Week 6
- Deepen hands-on SIEM skills and dive into Splunk log source investigations
- Work through upcoming Hack The Box Sherlocks for practical SOC triage practice
