
# Incident Investigation Report: Credential Access & Defense Evasion Analysis

## 1. Executive Summary

During a forensic investigation on endpoint `ACADEMY-SFUND-WIN10` (`10.129.153.92`), ingested log telemetry was analyzed in Splunk to identify post-exploitation activity.

  

The analysis revealed an adversary performing **Credential Access** via an LSASS memory dump utilizing `ProcessHacker.exe`, followed by **Defense Evasion / Execution** leveraging parent process spoofing via `WerFault.exe` to run discovery commands (`whoami`). Analysis of authentication telemetry confirmed that no unauthorized network or interactive user logons occurred immediately following the credential extraction phase.

  

## 2. Chronological Timeline of Events

|**Timestamp (UTC/Local)**|**Event Type / ID**|**Source Process**|**Target Process**|**Granted Access / Command**|**Incident Significance**|
|---|---|---|---|---|---|
|**2022-04-27 19:08:52**|Sysmon ID 10|`ProcessHacker.exe`|`lsass.exe`|`0x1000` (`PROCESS_QUERY_LIMITED_INFORMATION`)|Initial process handles requested against LSASS.|
|**2022-04-27 19:08:56**|Sysmon ID 10|`ProcessHacker.exe`|`lsass.exe`|`0x1fffff` (`PROCESS_ALL_ACCESS`)|**LSASS Memory Dump Executed.** Full process access handle opened.|
|**2022-04-27 19:09:44**|Security ID 4624|`NT AUTHORITY\SYSTEM`|N/A|Logon Type 5|Routine background service logon. **No malicious login detected.**|
|**2022-04-27 19:17:25**|Sysmon ID 1|`explorer.exe`|`WerFault.exe`|`"C:\Windows\System32\werfault.exe"`|Initial execution of Windows Error Reporting binary.|
|**2022-04-27 19:18:06**|Sysmon ID 1|`WerFault.exe`|`cmd.exe`|`cmd.exe /c whoami`|**Anomalous Execution / PPID Spoofing.** `WerFault.exe` illegally spawns `cmd.exe`.|

## 3. Stage-by-Stage Investigation Walkthrough

### Stage 1: Credential Access Detection (LSASS Memory Dump)

#### Objective

Detect process memory dumping or credential harvesting targeting the Local Security Authority Subsystem Service (`lsass.exe`).

  

#### Technical Rationale

Threat actors query `lsass.exe` to extract plaintext credentials, NTLM hashes, and Kerberos tickets stored in memory. Sysmon Event ID 10 (`ProcessAccess`) records when a process opens a handle to another process. Filtering in Splunk for target processes matching `lsass.exe` while excluding legitimate system callers (e.g., `svchost.exe`, `csrss.exe`) isolates unauthorized access handles.

  

#### Splunk SPL Query Executed

Splunk SPL

```
index=main EventCode=10 TargetImage="*\\lsass.exe" NOT SourceImage IN ("*\\lsass.exe", "*\\svchost.exe", "*\\csrss.exe")
| table _time SourceImage TargetImage GrantedAccess CallTrace
```

#### Artifact Findings

- **Tool Used:** `C:\Users\waldo\Downloads\processhacker-3.0.4801-bin\64bit\ProcessHacker.exe`
    
      
    
- **Target Process:** `C:\Windows\system32\lsass.exe`
    
      
    
- **Access Mask:** `0x1fffff` (`PROCESS_ALL_ACCESS`), indicating full read/write/operation access required to create a process dump file.
    
      
    
- **Timestamp:** `4/27/2022 7:08:56 PM`
    
      
    

### Stage 2: Post-Dump Authentication Verification

#### Objective

Determine if the adversary successfully used extracted credentials to authenticate, move laterally, or initiate new remote sessions immediately following the LSASS dump.

  

#### Technical Rationale

Windows Security Event ID 4624 logs successful logon events. By searching logs created after the LSASS dump timestamp (`4/27/2022 7:08:56 PM`) and evaluating `LogonType`, analysts can differentiate between legitimate background system activity and unauthorized logins:

  

- **Logon Type 2:** Interactive (Local Console)
    
      
    
- **Logon Type 3:** Network (SMB, WinRM)
    
      
    
- **Logon Type 5:** Service Logon (Background System Tasks)
    
      
    
- **Logon Type 10:** Remote Interactive (RDP)
    
      
    

#### Splunk SPL Query Executed

Splunk SPL

```
index=main EventCode=4624 earliest="04/27/2022:19:08:56"
| table _time TargetUserName LogonType IpAddress WorkstationName
```

#### Artifact Findings

- **Events Recorded:** Logons at `7:09:44 PM` and `7:09:45 PM`.
    
      
    
- **Account:** `SYSTEM`
    
      
    
- **Logon Type:** `5` (Service Logon).
    
      
    
- **Conclusion:** No user logons (Type 2, 3, or 10) occurred post-extraction. **Ill-intended login status: No.**
    
      
    

### Stage 3: Defense Evasion & PPID Spoofing Analysis

#### Objective

Analyze process creation telemetry (Sysmon Event ID 1) in Splunk to identify suspicious execution patterns or parent-child process anomalies.

  

#### Technical Rationale

Attackers often use Parent Process ID (PPID) Spoofing or Process Hollowing to make malicious executions appear legitimate. `WerFault.exe` (Windows Error Reporting) is designed strictly for fault handling and error reporting; it should **never** legitimately act as a parent process spawning command interpreters (`cmd.exe` or `powershell.exe`).

  

#### Splunk SPL Query Executed

Splunk SPL

```
index=main EventCode=1
| table _time ParentImage Image CommandLine
```

#### Artifact Findings

- **Parent Image:** `C:\Windows\System32\WerFault.exe`
    
      
    
- **Child Image Spawned:** `C:\Windows\System32\cmd.exe`
    
      
    
- **Executed Command:** `cmd.exe /c whoami`
    
      
    
- **Timestamp:** `4/27/2022 7:18:06 PM`
    
      
    
- **Abused Process:** `WerFault.exe` (leveraged via PPID spoofing to evade security controls and execute recon commands).
    

## 4. Key Reference Matrix for Future Investigations

|**Detection Focus**|**Primary Event Log ID**|**Critical Fields / Attributes**|**Key Indicators of Compromise (IoCs) & SPL Filters**|
|---|---|---|---|
|**LSASS Dumping**|Sysmon Event ID 10|`TargetImage`, `SourceImage`, `GrantedAccess`|`EventCode=10 TargetImage="*\\lsass.exe"` looking for access masks like `0x1fffff` or `0x1010` from non-system paths.|
|**Logon Analysis**|Windows Security Event ID 4624|`TargetUserName`, `LogonType`, `IpAddress`|`EventCode=4624` inspecting for unexpected Type 3 (Network) or Type 10 (RDP) logons post-credential access.|
|**PPID Spoofing**|Sysmon Event ID 1|`ParentImage`, `Image`, `CommandLine`|`EventCode=1` looking for core system binaries (`WerFault.exe`, `spoolsv.exe`) acting as parents to `cmd.exe` or `powershell.exe`.|