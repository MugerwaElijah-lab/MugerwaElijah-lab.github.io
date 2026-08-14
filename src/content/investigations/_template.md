---
title: "Sherlock Name"
difficulty: "Medium"
date: 2026-08-10
summary: "Brief summary of initial investigative alert premise."
tools: ["Wireshark", "Volatility 3", "Eric Zimmerman Tools", "EVTX ECmd"]
published: false
---

## Introduction & Scenario

State the Sherlock's name, difficulty, and a brief summary of the initial investigative premise or alert.

## Tools & Environment

List out analysis software utilized:
- **Wireshark** — Network traffic PCAP analysis
- **Volatility 3** — RAM memory forensics
- **Eric Zimmerman Tools (KAPE / Registry Explorer)** — Windows artifact analysis
- **Autopsy** — Disk forensic triage

## Step-by-Step Investigation

Walk through each task question sequentially.

### Task 1: [Question text from HTB]

**Answer:** `answer_here`

**Investigation:**
Include relevant filters, command syntax, or registry paths.

```bash
vol -f memory.dmp windows.pstree
```

### Task 2: [Question text from HTB]

**Answer:** `answer_here`

**Investigation:**
Detailed breakdown of evidentiary findings.

## Evidence & IOCs

| Indicator | Type | Context / Description |
|---|---|---|
| `192.168.1.100` | IP Address | Attacker Command & Control Server |
| `a1b2c3d4...` | SHA256 Hash | Malicious binary hash |
| `evil.exe` | File Name | Dropped executable |

### Attack Chain & MITRE Mapping

- **T1059.001**: PowerShell Command Execution
- **T1550.002**: Pass-the-Hash Attack
