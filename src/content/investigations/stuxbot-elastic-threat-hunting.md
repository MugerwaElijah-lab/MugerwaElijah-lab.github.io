---
title: "Stuxbot Incident & Elastic SIEM Threat Hunting Walkthrough"
category: "HTB CDSA Investigation"
difficulty: "Advanced"
date: 2026-09-07
summary: "Comprehensive hypothesis-driven threat hunting investigation on the Stuxbot adversary campaign using Elastic SIEM and Kibana (KQL). Deconstructed secondary payload execution (VBScript), DCSync credential dumping (Mimikatz), in-memory PowerView reconnaissance, C:\\Users\\Public tool staging, Registry Run key persistence, and WinRM lateral movement targeting Domain Controllers."
tools: ["Elastic SIEM", "Kibana (KQL)", "Sysmon", "PowerShell Script Block Logging", "Mimikatz", "PowerView", "WinRM"]
published: true
---

## Executive Summary & Mission Scope

This investigation documents the end-to-end digital forensics and proactive threat hunting methodologies applied during the **Stuxbot** adversary simulation on **Hack The Box (HTB CDSA)**. 

Using **Elastic Security / Kibana** and structured **KQL (Kibana Query Language)** against Windows host events, Sysmon telemetry, and PowerShell script block logs, the investigation uncovered an intrusion campaign spanning initial secondary payload execution, domain credential harvesting, memory-resident reconnaissance, tool staging in world-writable paths, autostart registry persistence, and lateral movement targeting Domain Controllers.

```text
┌─────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│ Initial Staging │ ───► │  Credential Harvesting  │ ───► │  Memory-Resident Recon  │
│ default.exe     │      │  Mimikatz DCSync Attack │      │  PowerView (EID 4104)   │
│ XceGuhkzaTrOy   │      │  Domain: eagle.local    │      │  AD Domain & Share Enum │
└─────────────────┘      └─────────────────────────┘      └─────────────────────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│  Tool Staging   │ ───► │  Registry Persistence   │ ───► │    Lateral Movement     │
│ C:\Users\Public │      │  Run / RunOnce Keys     │      │  WinRM / wsmprovhost    │
│ svc-sql1        │      │  LgvHsviAUVTsIN         │      │  Target: DC1.eagle.local│
└─────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

---

## Investigation Overview & Environment Telemetry

| Parameter | Operational Specification |
|---|---|
| **Platform & Module** | Hack The Box Academy · Introduction to Threat Hunting with Elastic |
| **SIEM Platform** | Elastic Security (Elasticsearch & Kibana) |
| **Query Engine** | Kibana Query Language (KQL) & Lucene |
| **Target Domain** | `eagle.local` (Active Directory Domain Controller: `DC1`) |
| **Key Telemetry Sources** | Sysmon (EID 1, 11, 12, 13), Windows Security (EID 4624, 4688), PowerShell Script Block Logging (EID 4104) |
| **Compromised Account** | `svc-sql1` (Service Account leveraged for staging and lateral movement) |

---

## Phase 1: Stuxbot Incident Triage & Execution Analysis

### 1. The "Who & Why": Tracking Secondary Dropper Execution
During initial triage of a suspected compromise, endpoint telemetry flagged the execution of a suspicious binary named `default.exe`. Threat actors commonly utilize compiled droppers to spawn secondary scripting interpreters (e.g., `wscript.exe`, `cscript.exe`) to bypass signature-based executable detection and establish living-off-the-land execution loops.

### 2. Evidence Discovery & KQL Query
Searching for secondary script file drops and parent-child execution chains associated with `default.exe`:

```kql
process.parent.name : "default.exe" OR file.name : *.vbs
```

- **Discovered Artifact:** `XceGuhkzaTrOy.vbs`
- **Technical Finding:** The binary `default.exe` dropped and executed `XceGuhkzaTrOy.vbs` in the user temporary workspace. This VBScript acted as a secondary stage downloader and execution loop, initiating outbound communication while masking the binary process.

---

## Phase 2: Active Directory Credential Harvesting (DCSync Attack)

### 1. The "Who & Why": Dumping Domain Credentials
Once initial foothold was achieved, the adversary sought domain dominance by extracting credential material across all domain accounts in `eagle.local`. Rather than attacking LSASS memory directly on endpoints (which triggers EDR alerts), the attacker executed a **DCSync attack**.

```text
Attacker Host (svc-sql1) ────[ MS-DRSR Replication Request via RPC ]────► Domain Controller (DC1)
                         ◄───[ All User Hashes (NTLM / Kerberos) ]───────
```

### 2. Evidence Discovery & Telemetry Analysis
Searching process creation command-line arguments and security events:

```kql
process.command_line : *lsadump* OR process.command_line : *dcsync*
```

- **Discovered Artifact / Command:**
  ```text
  lsadump::dcsync /domain:eagle.local /all /csv, exit
  ```
- **Technical Finding:** The adversary leveraged `mimikatz.exe` to execute the DCSync feature. By pretending to be a domain controller synchronizing directory objects via the Directory Replication Service Remote Protocol (MS-DRSR), the attacker successfully dumped all domain user password hashes into CSV format.

---

## Phase 3: Memory-Resident Reconnaissance (PowerView)

### 1. The "Who & Why": Living-off-the-Land Discovery
To identify high-value targets, network shares, and domain trust paths without writing noisy reconnaissance tools to disk, the adversary utilized **PowerView** executed directly in memory via PowerShell.

### 2. Evidence Discovery via Script Block Logging (Event ID 4104)
Traditional file integrity monitoring misses memory-only scripts. However, **PowerShell Event ID 4104 (Script Block Logging)** reconstructs full code blocks executed in memory:

```kql
powershell.file.script_block_text : *PowerView* OR powershell.file.script_block_text : *Get-NetDomain*
```

- **Discovered Artifact:** `PowerView` (Active Directory reconnaissance framework).
- **Technical Finding:** PowerShell script block logging captured in-memory invocation of PowerView functions (`Get-DomainUser`, `Get-NetShare`, `Get-DomainTrust`) targeting `eagle.local` infrastructure to map attack paths toward the primary Domain Controller.

---

## Phase 4: Targeted Threat Hunts (KQL Query Construction)

### Hunt 1: Lateral Tool Transfer & Staging in Public Directories
- **Hypothesis:** Adversaries frequently stage non-native attack tools, staging archives, and staging scripts into world-writable directories such as `C:\Users\Public\` because service accounts and unprivileged users have default write permissions there.
- **KQL Query:**
  ```kql
  file.path : *C:\\Users\\Public* AND file.name : r*
  ```
- **Discovered Artifact:** Staged archive utility `rar.exe` written directly into `C:\Users\Public\`.
- **Attributed Context:** The service account `svc-sql1` was used to stage this utility under the public profile.

---

### Hunt 2: Autostart Persistence via Windows Registry Run Keys
- **Hypothesis:** To maintain access across system reboots without re-exploiting vulnerabilities, adversaries write autostart entries to Windows Registry `Run` or `RunOnce` keys.
- **KQL Query:**
  ```kql
  registry.path : *Run* OR registry.path : *RunOnce*
  ```
- **Discovered Value & Payload:**
  - **Registry Value Name:** `LgvHsviAUVTsIN`
  - **Registry Target Value:** `C:\Users\Public\rar.exe`
- **Technical Finding:** An obfuscated autostart key was created under `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`, ensuring `rar.exe` executes automatically whenever a user session is initiated.

---

### Hunt 3: Lateral Movement via PowerShell Remoting (WinRM)
- **Hypothesis:** Adversaries leverage native Windows management protocols like WinRM (TCP 5985/5986) to move laterally across enterprise workstations and target Domain Controllers without generating traditional interactive RDP sessions.
- **KQL Query:**
  ```kql
  winlog.event_data.TargetServerName : *DC1* OR process.name : "wsmprovhost.exe"
  ```
- **Target Host & Process:**
  - **Target Server:** `DC1.eagle.local` (Primary Domain Controller)
  - **Host Process:** `wsmprovhost.exe` (Windows Remote Management Worker Process)
  - **Identity:** `svc-sql1`
- **Technical Finding:** The adversary initiated remote PowerShell sessions (`wsmprovhost.exe`) from the staging machine directly into `DC1` using the compromised `svc-sql1` account credentials.

---

## MITRE ATT&CK Mapping & Evidence Matrix

| Attack Phase | MITRE Tactic | Technique / ID | Artifact / Command | Detection Source |
|---|---|---|---|---|
| **Initial Execution** | Execution | Command and Scripting Interpreter: VBScript (`T1059.005`) | `XceGuhkzaTrOy.vbs` dropped by `default.exe` | Sysmon EID 1 / Process Telemetry |
| **Credential Access** | Credential Access | OS Credential Dumping: DCSync (`T1003.006`) | `mimikatz.exe lsadump::dcsync /domain:eagle.local` | Sysmon EID 1 / Command-line |
| **Discovery** | Discovery | Domain Trust & Account Discovery (`T1087.002`) | Memory-resident `PowerView` invocation | PowerShell EID 4104 (Script Block) |
| **Defense Evasion** | Defense Evasion | Masquerading & Staging in Public Folders (`T1036`) | `C:\Users\Public\rar.exe` staged via `svc-sql1` | Sysmon EID 11 (FileCreate) |
| **Persistence** | Persistence | Boot/Logon Autostart: Registry Run Keys (`T1547.001`) | `LgvHsviAUVTsIN` pointing to `rar.exe` | Sysmon EID 13 (RegistryValueSet) |
| **Lateral Movement** | Lateral Movement | Remote Services: Windows Remote Management (`T1021.006`) | `wsmprovhost.exe` targeting `DC1.eagle.local` | Windows Security EID 4624 / Sysmon EID 1 |

---

## Defensive Hardening & Blue Team Recommendations

### 1. Service Account Least-Privilege & Access Segregation
- **Observation:** The service account `svc-sql1` possessed dangerous interactive logon and WinRM delegation rights, allowing lateral traversal to `DC1`.
- **Remediation:** 
  - Restrict service accounts from interactive and remote logons (`Deny logon locally`, `Deny logon through Remote Desktop Services`).
  - Implement **Managed Service Accounts (gMSA)** to automate complex password rotations and remove static credentials.

### 2. Execution Control on World-Writable Directories
- **Observation:** The adversary used `C:\Users\Public\` to stage secondary executables (`rar.exe`).
- **Remediation:** 
  - Deploy **AppLocker** or **Windows Defender Application Control (WDAC)** rules blocking binary execution from user-writable directories (`C:\Users\*\`, `C:\ProgramData\`, `C:\Windows\Temp\`).

### 3. Centralized Logging & Telemetry Enforcement
- **Observation:** Memory-resident PowerShell execution was invisible to basic process logs but clearly visible in Script Block Logging.
- **Remediation:** 
  - Enforce Group Policy for **PowerShell Script Block Logging (Event ID 4104)** and **Module Logging (Event ID 4103)** across all domain assets.
  - Ingest Sysmon telemetry (Process creation EID 1 with full CLI arguments, FileCreate EID 11, Registry modifications EID 12/13) directly into Elastic SIEM for automated correlation.

### 4. Active Directory DCSync Protection
- **Observation:** The attacker queried directory replication permissions without logging onto the DC.
- **Remediation:** 
  - Audit Active Directory Access Control Lists (ACLs) to ensure only authorized Domain Controllers have `DS-Replication-Get-Changes` and `DS-Replication-Get-Changes-All` extended rights.
  - Alert immediately on any non-DC IP requesting directory replication calls.
