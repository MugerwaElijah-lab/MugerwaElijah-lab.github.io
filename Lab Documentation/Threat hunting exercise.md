This report documents the forensic investigation and SIEM threat hunting activities conducted during the **Stuxbot** investigation on Hack The Box. Utilizing Elastic SIEM and Kibana, telemetry from Windows Event Logs, Sysmon, and PowerShell Script Block logs were analyzed to detect adversary actions across initial execution, credential harvesting, persistence, and lateral movement.

## 1. Stuxbot Incident Analysis

### Phase 1: Initial Payload & Script Execution

- **Investigation Focus:** Analysis of secondary execution artifacts tied to `default.exe`.
    
- **Artifact Identified:** `XceGuhkzaTrOy.vbs`
    
- **Finding:** A VBScript payload was staged and executed alongside `default.exe` to initiate secondary execution loops.
    

### Phase 2: Credential Dumping

- **Investigation Focus:** Identification of credential harvesting activity.
    
- **Artifact Identified:** `lsadump::dcsync /domain:eagle.local /all /csv, exit`
    
- **Finding:** Adversaries utilized `mimikatz.exe` to execute a DCSync attack against the `eagle.local` domain to dump active directory credentials in CSV format.
    

### Phase 3: Memory-Resident Enumeration

- **Investigation Focus:** PowerShell event log analysis (Event ID 4104).
    
- **Artifact Identified:** `PowerView`
    
- **Finding:** In-memory execution of the PowerView recon script was captured targeting Active Directory network shares and domain trusts.
    

## 2. Skills Assessment & Threat Hunts

### Hunt 1: Lateral Tool Transfer & Staging

- **Objective:** Identify tools staged in public/world-writable directories.
    
- **KQL Query:**
    
    Plaintext
    
    ```
    file.path : *C:\\Users\\Public* AND file.name : r*
    ```
    
- **Compromised Account:** `svc-sql1`
    
- **Finding:** The service account `svc-sql1` was leveraged to stage malicious tools starting with `r` in `C:\Users\Public\`.
    

### Hunt 2: Registry Persistence

- **Objective:** Detect autostart execution mechanisms created in the Windows Registry.
    
- **KQL Query:**
    
    Plaintext
    
    ```
    registry.path : *Run* OR registry.path : *RunOnce*
    ```
    
- **Registry Value:** `LgvHsviAUVTsIN`
    
- **Finding:** An obfuscated registry value was written under a `Run` key referencing `C:\Users\Public\rar.exe` for startup persistence.
    

### Hunt 3: PowerShell Remoting Lateral Movement

- **Objective:** Track remote execution targeting critical infrastructure (Domain Controllers).
    
- **KQL Query:**
    
    Plaintext
    
    ```
    winlog.event_data.TargetServerName : *DC1* OR process.name : "wsmprovhost.exe"
    ```
    
- **Compromised Account:** `svc-sql1`
    
- **Finding:** Lateral movement towards `DC1` was executed via WinRM / PowerShell Remoting (`wsmprovhost.exe`) using the `svc-sql1` credentials.
    

## 3. Defense & Mitigation Recommendations

1. **Service Account Hardening:** Enforce the principle of least privilege on service accounts like `svc-sql1`. Disable interactive logon and restrict WinRM access to authorized administrative hosts only.
    
2. **Directory Execution Restrictions:** Implement Software Restriction Policies (SRP), AppLocker, or Windows Defender Application Control (WDAC) to block executable binaries running directly out of `C:\Users\Public\` and user writeable directories.
    
3. **PowerShell Script Block Logging:** Maintain Event ID 4104 (Script Block Logging) and Event ID 4103 (Module Logging) enabling SOC analysts to inspect obfuscated or memory-resident scripts like PowerView.