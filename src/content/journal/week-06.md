---
week: 6
title: "Weekly Progress Log - Week 6 (SIEM Fundamentals, Splunk Architecture & SPL Incident Investigations)"
startDate: "14th September 2026"
summary: "Completed BTL1 SIEM module (log aggregation, Syslog, Windows Security Events, Sysmon, alerting logic). Studied Splunk architecture & SPL query crafting in HTB CDSA (earned badge), investigating LSASS dumping, PPID spoofing, and multi-stage BOTSv1 ransomware chains."
date: 2026-09-14
---

### **Week Starting:** 14th September 2026

## What I worked on

#### Blue Team Level One Prep - SIEM & Log Telemetry
- **Log Management & Ingestion Architecture:** Studied enterprise log generation, transmission mechanisms (Syslog, Windows Event Forwarding, Beats, Universal Forwarders), centralized aggregation pipelines, and indexing structures.
- **Windows Security & Sysmon Telemetry:** Deconstructed critical Windows event categories, zeroing in on Security Log IDs (Logon Types under EID 4624, Privilege Escalation EID 4672, Process Creation EID 4688) and Sysmon telemetry (Process Creation EID 1, Process Access EID 10, Driver/Image Load EID 6/7, FileCreate EID 11, Registry Events EID 12/13).
- **Splunk Query Construction & Rule Tuning:** Studied the architecture of Splunk search processing language (SPL), query optimization, statistical aggregation (`stats`, `eval`, `timechart`), and rule tuning to minimize false positives and filter out benign system noise.
- **Module Completion:** Successfully completed the BTL1 SIEM module after completing hands-on analysis and visualization labs.

#### HTB CDSA - Understanding Log Sources & Investigating with Splunk
- **Module Completion & Badge Earned:** Finished the comprehensive *Understanding Log Sources and Investigating with Splunk* module ([View HTB Achievement Badge](https://academy.hackthebox.com/achievement/badge/3470683a-b418-11f1-82d1-bea50ffe6cb4)).
- **Splunk Enterprise Architecture:** Analyzed Splunk core components (Forwarders, Indexers, Search Heads, Deployment Servers) and learned how raw data streams are transformed into indexed events with parsed metadata fields (`sourcetype`, `source`, `host`, `_time`).
- **Hands-on Incident Investigations:**
  - Conducted an in-depth investigation on host `ACADEMY-SFUND-WIN10` uncovering **LSASS memory dumping** via `ProcessHacker.exe` (Sysmon EID 10, GrantedAccess `0x1fffff`), followed by **PPID spoofing** where `WerFault.exe` anomalously spawned `cmd.exe`.
  - Reconstructed the complete **Boss of the SOC (BOTSv1)** attack chain: web vulnerability scanning (Acunetix), Joomla admin brute forcing, endpoint infection on `we8105desk`, Cerber ransomware masquerading as `osk.exe`, external IP lookup via `ipinfo.io` (Suricata alert), and mass UDP port 6892 botnet C2 beaconing across 16,384 unique IPs (Fortigate UTM detection).

## Key Takeaways

Gained a thorough structural understanding of Splunk data ingestion pipelines, field extraction, and the internal mechanics of how queries flow across search heads and indexers.

Understood the reasoning and analytical logic behind crafting **TTP-driven and analytics-driven SPL queries**. Rather than relying on static IOC lookups (like single IP addresses or filenames), effective threat detection hunts for behavioral patterns: abnormal access masks on `lsass.exe`, illegal parent-child process relationships (`WerFault.exe` spawning `cmd.exe`), and anomalous network beaconing frequencies.

Acquired practical confidence in cross-correlating multi-source telemetry in a single SIEM view: aligning endpoint Sysmon events with Windows Security logs, network firewall traffic (Fortigate), and NIDS alerts (Suricata) along an exact timeline of compromise.

## Challenges and Friction

Triage of large datasets in enterprise environments can be mentally overwhelming. Initially, sorting through thousands of raw events was time-consuming until I developed structured query filtering workflows (using `table`, `stats count by`, `dedup`, and `where` clauses).

Building fluent proficiency in SPL query syntax requires deliberate practice. Developing the intuition for pipe staging (`|`) and function nesting takes time, but I established a strong logical foundation that I will continue to refine through ongoing SOC labs.

## Looking Ahead
### Week 7
- Begin the core Incident Response and Handling module
- Deepen incident handling procedures and playbook execution on Hack The Box
- Complete additional Hack The Box Sherlocks to reinforce multi-stage SIEM investigations
