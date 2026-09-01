---
title: "FortySeven-1 — Mysterious Elephant (APT-K-47) Threat Intelligence Profile"
category: "Threat Intelligence / APT Profiling"
difficulty: "Intermediate"
date: 2026-08-24
summary: "Comprehensive threat actor profiling of Mysterious Elephant (APT-K-47): analyzing Hajj-themed spear-phishing lures, WinRAR CVE-2023-38831 exploitation, ORPCBackdoor DLL hijacking, Asyncshell C2, MemLoader sandbox evasion, and WhatsApp exfiltration tooling."
tools: ["OpenCTI / MISP", "MITRE ATT&CK", "Kaspersky GREAT Intelligence", "Knownsec 404 Research"]
published: true
---

## Introduction & Scenario

An Advanced Persistent Threat (APT) group has been identified using Hajj-themed phishing lures to target and exfiltrate WhatsApp data and sensitive communications from government and diplomatic officials. By analyzing and synthesizing fragmented intelligence from public cybersecurity vendor reports, research publications, and internal security feeds, this investigation constructs a comprehensive threat intelligence profile of the adversary.

### Intelligence Sources & Evidence Base

- **Kaspersky GREAT Analysis:** `https://securelist.com/mysterious-elephant-apt-ttps-and-tools/117596/`
- **Knownsec 404 Team Research (Part 1):** `https://medium.com/@knownsec404team/apt-k-47-mysterious-elephant-a-new-apt-organization-in-south-asia-5c66f954477`
- **Knownsec 404 Team Weaponry Breakdown (Asyncshell):** `https://medium.com/@knownsec404team/unveiling-the-past-and-present-of-apt-k-47-weapon-asyncshell-5a98f75c2d68`

---

## Threat Actor Overview & Operational History

**Mysterious Elephant** (also tracked by threat intelligence vendors as **APT-K-47**) is a South Asian cyber-espionage organization active since at least 2022. The group primarily targets diplomatic personnel, government organizations, and military entities, leveraging spear-phishing campaigns (frequently themed around official regional affairs and religious events) to compromise endpoints and exfiltrate sensitive files—with a distinct emphasis on WhatsApp communications, credentials, and confidential documents.

The group's operational tradecraft features a hybrid mix of custom-developed implants, modified open-source utilities, and code recycled from or shared with neighboring South Asian threat groups, including Confucius, SideWinder, BITTER, and Origami Elephant.

| Profile Field | Threat Intelligence Attribution |
|---------------|---------------------------------|
| **Primary Aliases** | Mysterious Elephant, APT-K-47 |
| **Origin / Region** | South Asia |
| **Activity Period** | 2022 – Present (Publicly disclosed by Kaspersky GREAT in 2023) |
| **Primary Targets** | Diplomatic entities, government organizations, and military institutions (notably within South Asia / Pakistan) |
| **Motivation** | Strategic Cyber Espionage & Sensitive Data Theft |
| **Tooling Overlap** | SideWinder, Confucius, BITTER, Origami Elephant |

---

## Technical Analysis & Signature Tooling

### 1. Delivery & Initial Access

- **Exploitation of Known Vulnerabilities:** Early delivery chains relied on remote template injection and **CVE-2017-11882** (Equation Editor). Modern campaigns utilize malicious WinRAR archives exploiting **CVE-2023-38831** to execute payloads disguised as official meeting minutes or diplomatic notices.
- **Vtyrei Downloader:** Recycled downloader module originally tied to Origami Elephant, utilized in early Mysterious Elephant intrusion sets.

---

### 2. Backdoor Execution & Persistence

#### ORPCBackdoor
Custom backdoor communicating via Office Remote Procedure Call (ORPC):
- **DLL Hijacking:** Utilizes the `version.dll` template via exported function `GetFileVersionInfoByHandleEx(void)` to execute under trusted process contexts (e.g., `MicrosoftServices`).
- **Persistence Verification:** Checks whether `ts.dat` exists in its execution path. If missing, it invokes COM interfaces for TaskScheduler to create a scheduled task named `Microsoft Update` and drops `ts.dat` to prevent redundant task creation.

#### Asyncshell (Asyncshell-v2)
A core custom backdoor maintained since 2023. Recent iterations (v2) upgraded Command-and-Control (C2) channels from raw TCP to encrypted HTTPS to blend with benign enterprise traffic.

#### MemLoader HidenDesk
Reflective PE loader deployed via intermediate stagers to execute secondary payloads in memory:
- **Sandbox Evasion:** Evaluates system processes upon launch and immediately terminates execution if fewer than **40 active processes** are detected.
- **Covert Workspace:** Spawns and switches execution to a hidden desktop session named `MalwareTech_Hidden`.
- **Persistence:** Drops a shortcut file into the Windows Startup autostart directory.
- **Payload:** Decrypts embedded shellcode using an RC4-like algorithm to launch commercial remote access trojans (such as Remcos RAT).

---

### 3. Exfiltration Modules

The threat actor deploys specialized post-exploitation tools designed for recursive directory traversal and targeted data exfiltration over primary C2 channels:

- **Stom Exfiltrator:** Recursively scans non-system drives, `Desktop`, and `Downloads` folders. Latest variants specifically hunt for hardcoded WhatsApp folder paths to harvest attachments, shared media, and chat archives.
- **Uplo Exfiltrator:** Employs depth-first search algorithms to harvest documents (`.TXT`, `.DOCX`, `.PDF`, `.XLSX`), certificates (`.PFX`), and contact cards (`.VCF`) using XOR-deobfuscated C2 endpoints.
- **ChromeStealer Exfiltrator:** Custom binary (`WhatsAppOB.exe`) targeting browser-stored credentials and web session artifacts.

---

## MITRE ATT&CK Framework Mapping

| Tactic | Technique / Sub-Technique | ID | Observed Artifact / Operational Context |
|--------|--------------------------|-----|-----------------------------------------|
| **Initial Access** | Exploitation for Client Execution | `T1203` | Exploitation of `CVE-2017-11882` and `CVE-2023-38831` archive vulnerabilities. |
| **Execution** | Command and Scripting Interpreter: PowerShell | `T1059.001` | Execution of PowerShell scripts for payload staging and operational commands. |
| **Persistence** | Boot or Logon Autostart Execution: Startup Folder | `T1547.001` | MemLoader HidenDesk dropping shortcut files into system autostart directories. |
| **Persistence** | Scheduled Task/Job: Scheduled Task | `T1053.005` | ORPCBackdoor invoking COM TaskScheduler to create the `Microsoft Update` task. |
| **Defense Evasion** | Hijack Execution Flow: DLL Side-Loading | `T1574.002` | ORPCBackdoor abusing `version.dll` export functions (`GetFileVersionInfoByHandleEx`). |
| **Defense Evasion** | Virtualization / Sandbox Evasion: System Checks | `T1497.001` | MemLoader terminating execution if active system processes count is < 40. |
| **Defense Evasion** | Hidden Window | `T1564.003` | Spawning and executing payloads inside hidden desktop session `MalwareTech_Hidden`. |
| **Exfiltration** | Exfiltration Over C2 Channel | `T1041` | Modular exfiltrators (Uplo, Stom, ChromeStealer) transferring stolen files over existing C2 paths. |

---

## Indicators of Compromise (IOCs)

### File Hashes & Vulnerabilities

| Indicator / Vulnerability | Type | Context |
|---------------------------|------|---------|
| `9e50adb6107067ff0bab73307f5499b6` | MD5 | ChromeStealer Exfiltrator (`WhatsAppOB.exe`) |
| `CVE-2023-38831` | CVE | WinRAR File Extension Spoofing / Code Execution |
| `CVE-2017-11882` | CVE | Microsoft Office Equation Editor Memory Corruption |

### Host & Execution Artifacts

| Artifact | Category | Operational Function |
|----------|----------|----------------------|
| `Microsoft Update` | Scheduled Task | Persistence task created by ORPCBackdoor |
| `ts.dat` | Marker File | State check file preventing redundant scheduled task creation |
| `MalwareTech_Hidden` | Hidden Desktop | Covert desktop environment used by MemLoader to hide UI |
| `GetFileVersionInfoByHandleEx` | DLL Export | Export function abused in `version.dll` hijacking chain |

---

## Key Takeaways & Threat Hunting Rules

1. **Monitor DLL Side-Loading on `version.dll`:** Flag non-standard binaries loading `version.dll` from user-writable directories or unexpected export calls to `GetFileVersionInfoByHandleEx`.
2. **Scheduled Task Auditing:** Alert on newly registered scheduled tasks named `Microsoft Update` that do not originate from verified Windows Update binaries.
3. **Hidden Desktop Detection:** Instrument EDR rules to identify processes invoking `CreateDesktop` / `SetThreadDesktop` targeting hidden sessions (`MalwareTech_Hidden`).
4. **WhatsApp Attachment Directory Monitoring:** Monitor unauthorized processes recursively enumerating `WhatsApp` desktop data stores or staging archives of `.PFX`, `.VCF`, and `.DOCX` files.
