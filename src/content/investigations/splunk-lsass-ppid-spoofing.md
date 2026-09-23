---
title: "Splunk SIEM Triage: LSASS Credential Access & PPID Spoofing Analysis"
category: "HTB CDSA Investigation"
difficulty: "Intermediate"
date: 2026-09-14
summary: "Forensic analysis and threat hunting on endpoint ACADEMY-SFUND-WIN10 using Splunk SIEM. Detected LSASS memory dumping via ProcessHacker.exe (Sysmon EID 10, GrantedAccess 0x1fffff), evaluated post-dump Windows authentication telemetry (Event ID 4624 Logon Types), and isolated parent-child process anomalies involving WerFault.exe PPID spoofing."
tools: ["Splunk Enterprise", "SPL", "Sysmon (EID 1, 10)", "Windows Security Logs (EID 4624)", "ProcessHacker", "WerFault.exe"]
published: true
---

## Executive Summary & Incident Scope

During digital forensics and incident triage on Windows endpoint **`ACADEMY-SFUND-WIN10`** (`10.129.153.92`), ingested host event telemetry was analyzed in **Splunk Enterprise** to identify unauthorized post-exploitation activity.

The investigation exposed a multi-stage intrusion sequence:
1. **Credential Access (LSASS Memory Dump):** The adversary opened handles to the Local Security Authority Subsystem Service (`lsass.exe`) using a standalone `ProcessHacker.exe` binary, escalating permissions from query-level (`0x1000`) to full access (`0x1fffff` - `PROCESS_ALL_ACCESS`) to write a process dump to disk.
2. **Post-Dumping Authentication Triage:** Analysis of Windows Security Event ID 4624 events immediately following the dump confirmed that no malicious interactive (Logon Type 2), network (Logon Type 3), or remote desktop (Logon Type 10) sessions were initiated with the harvested credentials during the captured timeframe.
3. **Defense Evasion (PPID Spoofing & Reconnaissance):** The attacker executed discovery commands (`whoami`) by spoofing `WerFault.exe` (Windows Error Reporting) as the parent process to bypass endpoint detection rules looking for command shells spawned directly by suspicious binaries.

```text
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│ Credential Extraction   │ ───► │  Authentication Triage  │ ───► │ Defense Evasion & Recon │
│ ProcessHacker.exe       │      │  Security EID 4624      │      │ Sysmon EID 1            │
│ Target: lsass.exe       │      │  Logon Type 5 (SYSTEM)  │      │ WerFault.exe (Parent)   │
│ GrantedAccess: 0x1fffff │      │  No Malicious Logins    │      │ Child: cmd.exe /c whoami│
└─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

---

## Investigation Overview & Environment Telemetry

| Parameter | Operational Specification |
|---|---|
| **Platform & Module** | Hack The Box Academy · Understanding Log Sources & Investigating with Splunk |
| **SIEM Platform** | Splunk Enterprise |
| **Investigation Scope** | Post-Exploitation Triage on `ACADEMY-SFUND-WIN10` (`10.129.153.92`) |
| **Log Sources** | Microsoft-Windows-Sysmon/Operational (EID 1, 10), Security (EID 4624) |
| **Primary Focus** | MITRE ATT&CK T1003.001 (OS Credential Dumping: LSASS Memory), T1134.004 (Access Token Manipulation: Parent PID Spoofing) |

---

## Chronological Attack Timeline

| Timestamp (UTC) | Event Log & ID | Source / Parent | Target / Child | Access Mask / CommandLine | Operational Significance |
|---|---|---|---|---|---|
| **2022-04-27 19:08:52** | Sysmon EID 10 | `ProcessHacker.exe` | `lsass.exe` | `0x1000` (`PROCESS_QUERY_LIMITED_INFORMATION`) | Attacker identifies and queries LSASS PID. |
| **2022-04-27 19:08:56** | Sysmon EID 10 | `ProcessHacker.exe` | `lsass.exe` | `0x1fffff` (`PROCESS_ALL_ACCESS`) | **Full LSASS memory dump initiated** to disk. |
| **2022-04-27 19:09:44** | Security EID 4624 | `NT AUTHORITY\SYSTEM` | N/A | Logon Type 5 (Service) | Benign background Windows system service logon. |
| **2022-04-27 19:17:25** | Sysmon EID 1 | `explorer.exe` | `WerFault.exe` | `"C:\Windows\System32\werfault.exe"` | Error reporting service binary instantiated. |
| **2022-04-27 19:18:06** | Sysmon EID 1 | `WerFault.exe` | `cmd.exe` | `cmd.exe /c whoami` | **PPID Spoofing detected.** `WerFault.exe` illegally spawns `cmd.exe`. |

---

## Stage-by-Stage Forensic Breakdown

### Stage 1: Detecting LSASS Memory Dumping via Sysmon (Event ID 10)

#### 1. The "Who, Why, & How"
- **The Threat:** The `lsass.exe` process is responsible for enforcing security policy, handling password changes, and storing hashed/encrypted credentials in memory (such as NTLM password hashes, Kerberos tickets, and cached domain credentials).
- **The Technique:** Adversaries frequently use administrative tools like Process Hacker, ProcDump, Mimikatz, or custom tools to dump LSASS memory space. Once written to a file, credentials can be parsed offline without running noisy tools against live memory.
- **The Forensic Signal:** In Sysmon, **Event ID 10 (`ProcessAccess`)** reports when a process requests an access handle to another process. Normal system processes (like `csrss.exe` or `svchost.exe`) legitimately access `lsass.exe` with restricted access rights. However, third-party executables requesting **`0x1fffff` (`PROCESS_ALL_ACCESS`)** or `0x1010` (`PROCESS_QUERY_LIMITED_INFORMATION | PROCESS_VM_READ`) signal memory dumping attempts.

#### 2. Splunk SPL Query Construction

```spl
index=main EventCode=10 TargetImage="*\\lsass.exe" NOT SourceImage IN ("*\\lsass.exe", "*\\svchost.exe", "*\\csrss.exe")
| table _time SourceImage TargetImage GrantedAccess CallTrace
```

#### 3. Query Breakdown & Forensic Findings
- `index=main EventCode=10`: Restricts results to Sysmon Process Access events.
- `TargetImage="*\\lsass.exe"`: Filters specifically for processes targeting the Local Security Authority Subsystem.
- `NOT SourceImage IN (...)`: Suppresses known benign Windows core processes that frequently touch LSASS.
- `table _time SourceImage TargetImage GrantedAccess CallTrace`: Formats the results to reveal the exact timestamp, calling binary, target, access rights, and memory call trace.

```text
+---------------------+-----------------------------------------------------------------------------------+-----------------------------+---------------+
| _time               | SourceImage                                                                       | TargetImage                 | GrantedAccess |
+---------------------+-----------------------------------------------------------------------------------+-----------------------------+---------------+
| 2022-04-27 19:08:52 | C:\Users\waldo\Downloads\processhacker-3.0.4801-bin\64bit\ProcessHacker.exe       | C:\Windows\system32\lsass.exe| 0x1000        |
| 2022-04-27 19:08:56 | C:\Users\waldo\Downloads\processhacker-3.0.4801-bin\64bit\ProcessHacker.exe       | C:\Windows\system32\lsass.exe| 0x1fffff      |
+---------------------+-----------------------------------------------------------------------------------+-----------------------------+---------------+
```

- **Forensic Finding:** A standalone binary located in `C:\Users\waldo\Downloads\processhacker-3.0.4801-bin\64bit\ProcessHacker.exe` was executed by user `waldo`. At `19:08:52`, it requested query permissions (`0x1000`), followed immediately at `19:08:56` by requesting `0x1fffff` (`PROCESS_ALL_ACCESS`) to perform the full LSASS memory dump.

---

### Stage 2: Post-Dump Authentication Triage (Security Event ID 4624)

#### 1. The "Who, Why, & How"
- **The Threat:** Once an adversary dumps LSASS, their immediate next objective is usually **Lateral Movement** (using extracted credentials to authenticate to domain controllers, file servers, or adjacent workstations via SMB, RDP, or WinRM).
- **The Forensic Signal:** Windows Security **Event ID 4624** records every successful logon session. To verify whether stolen credentials were immediately weaponized, the SOC analyst inspects the `LogonType` of all authentication events occurring after the dump timestamp (`19:08:56`).

#### 2. Understanding Windows Logon Types

| Logon Type | Meaning | Operational Context in Incident Triage |
|---|---|---|
| **Type 2** | Interactive | Direct logon via local console keyboard/monitor. |
| **Type 3** | Network | Remote connection over the network (e.g., SMB file shares, WinRM, IIS). Primary indicator of lateral movement. |
| **Type 4** | Batch | Scheduled tasks executing under a user context. |
| **Type 5** | Service | Background services started by the Service Control Manager. |
| **Type 10** | RemoteInteractive | Terminal Services, Remote Desktop (RDP), or Remote Assistance. |

#### 3. Splunk SPL Query Construction

```spl
index=main EventCode=4624 earliest="04/27/2022:19:08:56"
| table _time TargetUserName LogonType IpAddress WorkstationName
```

#### 4. Forensic Evaluation & Finding

```text
+---------------------+----------------+-----------+-----------+-----------------+
| _time               | TargetUserName | LogonType | IpAddress | WorkstationName |
+---------------------+----------------+-----------+-----------+-----------------+
| 2022-04-27 19:09:44 | SYSTEM         | 5         | -         | -               |
| 2022-04-27 19:09:45 | SYSTEM         | 5         | -         | -               |
+---------------------+----------------+-----------+-----------+-----------------+
```

- **Forensic Assessment:** The only successful logons registered post-dump were **Logon Type 5** executed by the local `NT AUTHORITY\SYSTEM` account for routine background service maintenance.
- **Conclusion:** No remote interactive (Type 10), network interactive (Type 3), or console (Type 2) logons occurred. **Unauthorized login status: Negative.**

---

### Stage 3: Defense Evasion & Parent Process Spoofing (Sysmon Event ID 1)

#### 1. The "Who, Why, & How"
- **The Threat:** Modern EDR and SOC detection rules alert when non-standard executables (e.g., dropped malware binaries or downloaders) spawn command shells (`cmd.exe`, `powershell.exe`).
- **The Technique (PPID Spoofing):** Adversaries manipulate the process creation attributes using the Windows API (`UpdateProcThreadAttribute` with `PROC_THREAD_ATTRIBUTE_PARENT_PROCESS`) to make a newly spawned process appear as though it was created by a legitimate, trusted system process (like `explorer.exe`, `svchost.exe`, or `WerFault.exe`).
- **The Forensic Signal:** `WerFault.exe` is the Windows Error Reporting process. It handles process crashes and telemetry generation. **`WerFault.exe` has no legitimate engineering reason to ever spawn `cmd.exe` or `powershell.exe`.** A parent-child relationship of `WerFault.exe -> cmd.exe` is a high-fidelity indicator of PPID spoofing.

#### 2. Splunk SPL Query Construction

```spl
index=main EventCode=1
| table _time ParentImage Image CommandLine
```

#### 3. Forensic Evidence

```text
+---------------------+-------------------------------------+-------------------------------+--------------------+
| _time               | ParentImage                         | Image                         | CommandLine        |
+---------------------+-------------------------------------+-------------------------------+--------------------+
| 2022-04-27 19:17:25 | C:\Windows\explorer.exe             | C:\Windows\System32\WerFault.exe| "C:\Windows\System32\werfault.exe" |
| 2022-04-27 19:18:06 | C:\Windows\System32\WerFault.exe    | C:\Windows\System32\cmd.exe   | cmd.exe /c whoami  |
+---------------------+-------------------------------------+-------------------------------+--------------------+
```

- **Forensic Finding:** At `19:18:06`, `WerFault.exe` was observed spawning `cmd.exe` executing `whoami`. This confirmed that the threat actor leveraged `WerFault.exe` via PPID spoofing to evade parent-process heuristics while conducting local user context discovery.

---

## Detection Engineering & SOC Reference Matrix

| Detection Focus | Primary Telemetry | Critical SPL Filters & Logic | MITRE ATT&CK ID |
|---|---|---|---|
| **LSASS Memory Dumping** | Sysmon EID 10 (`ProcessAccess`) | `EventCode=10 TargetImage="*\\lsass.exe" GrantedAccess IN ("0x1fffff", "0x1010", "0x1410") NOT SourceImage IN ("*\\svchost.exe", "*\\csrss.exe")` | [T1003.001](https://attack.mitre.org/techniques/T1003/001/) |
| **Post-Exploit Lateral Auth** | Windows Security EID 4624 | `EventCode=4624 LogonType IN (3, 10) NOT TargetUserName IN ("*$", "SYSTEM", "ANONYMOUS LOGON")` | [T1078](https://attack.mitre.org/techniques/T1078/) |
| **PPID Spoofing via Error Reporting** | Sysmon EID 1 (`ProcessCreate`) | `EventCode=1 ParentImage="*\\WerFault.exe" Image IN ("*\\cmd.exe", "*\\powershell.exe", "*\\pwsh.exe", "*\\wscript.exe", "*\\cscript.exe")` | [T1134.004](https://attack.mitre.org/techniques/T1134/004/) |
| **Local Discovery Execution** | Sysmon EID 1 / Security EID 4688 | `EventCode=1 Image="*\\cmd.exe" CommandLine IN ("*whoami*", "*net user*", "*net group*", "*systeminfo*")` | [T1033](https://attack.mitre.org/techniques/T1033/) |

---

## Lessons Learned & Defensive Recommendations

1. **Enable LSA Protection (RunAsPPL):** Configure Windows Credential Guard and protected process mode for LSASS (`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa\RunAsPPL=1`). This blocks non-protected processes from requesting read or all-access masks against `lsass.exe`, preventing Process Hacker and Mimikatz from dumping LSASS memory.
2. **Alert on High-Risk Sysmon EID 10 Access Masks:** Implement high-priority SIEM alerts on any non-whitelisted process requesting `0x1fffff`, `0x1010`, or `0x1410` against `lsass.exe`.
3. **Behavioral Parent-Child Process Monitoring:** Establish strict correlation rules that trigger immediate SOC escalation whenever trusted Windows binaries (`WerFault.exe`, `spoolsv.exe`, `calc.exe`, `notepad.exe`) spawn command interpreters or scripting engines.
4. **Attack Surface Reduction (ASR):** Deploy Microsoft Defender ASR rule *"Block credential stealing from the Windows local security authority subsystem (lsass.exe)"* across all domain endpoints.
