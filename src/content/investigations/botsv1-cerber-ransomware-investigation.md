---
title: "Boss of the SOC (BOTSv1): Multi-Stage Ransomware & C2 Attack Chain Triage"
category: "Threat Hunting & SIEM"
difficulty: "Advanced"
date: 2026-09-15
summary: "End-to-end DFIR investigation using Splunk on BOTSv1 telemetry. Uncovered Acunetix web vulnerability scanning (40.80.148.42), Joomla brute-force login attacks (23.22.63.114), endpoint host infection of bob.smith on we8105desk, Cerber ransomware masquerading as osk.exe (Sysmon EID 7 hash), ipinfo.io external IP lookup (Suricata NIDS), and mass UDP port 6892 C2 botnet beaconing across 16,384 unique IPs (Fortigate UTM)."
tools: ["Splunk Enterprise", "SPL", "Sysmon (EID 1, 7)", "Suricata NIDS", "Fortigate UTM Firewall", "IIS / Web Logs", "VirusTotal"]
published: true
---

## Executive Summary & Incident Scope

This investigation details the comprehensive end-to-end forensic analysis of the **Boss of the SOC (BOTSv1)** dataset using **Splunk Enterprise**. By cross-correlating multi-source enterprise telemetry, including web server access logs, Windows endpoint telemetry (Sysmon), Network Intrusion Detection System alerts (Suricata), and Next-Generation Firewall logs (Fortigate UTM), the full lifecycle of an adversary campaign was reconstructed.

The attack spanned initial perimeter reconnaissance, web application brute forcing, endpoint host infection via masqueraded ransomware payloads, external IP discovery, and large-scale decentralized Command and Control (C2) botnet beaconing.

```text
┌───────────────────────────────────────┐      ┌───────────────────────────────────────┐
│     Phase 1: Web Recon & Brute Force  │ ───► │     Phase 2: Endpoint Infection       │
│  - Scanner: 40.80.148.42 (Acunetix)   │      │  - Host: we8105desk (192.168.250.100) │
│  - Brute Force: 23.22.63.114 (Joomla) │      │  - User: WAYNECORPINC\bob.smith       │
│  - Target: imreallynotbatman.com      │      │  - Payload: osk.exe (Cerber Ransomware│
└───────────────────────────────────────┘      └───────────────────────────────────────┘
                                                               │
                                                               ▼
┌───────────────────────────────────────┐      ┌───────────────────────────────────────┐
│     Phase 4: Mass C2 Beaconing        │ ◄─── │     Phase 3: External IP Discovery    │
│  - Outbound UDP Port 6892             │      │  - HTTP GET to ipinfo.io (54.148.194) │
│  - 16,384 Unique IP Addresses         │      │  - Suricata: ET POLICY External IP    │
│  - Fortigate UTM: Cerber.Botnet Alert │      │  - Identifies egress gateway & IP     │
└───────────────────────────────────────┘      └───────────────────────────────────────┘
```

---

## Investigation Overview & Multi-Source Telemetry

| Parameter | Operational Specification |
|---|---|
| **SIEM Platform** | Splunk Enterprise |
| **Dataset** | Splunk Boss of the SOC (BOTSv1) |
| **Target Organization** | Wayne Enterprises (`waynecorpinc.local`) |
| **Target Web Property** | `imreallynotbatman.com` (`192.168.250.70`) |
| **Compromised Endpoint** | `we8105desk.waynecorpinc.local` (`192.168.250.100`) |
| **Compromised User Account** | `WAYNECORPINC\bob.smith` |
| **Telemetry Ingested** | IIS Web Logs (`sourcetype=iis`), Sysmon (`sourcetype=XmlWinEventLog:Microsoft-Windows-Sysmon/Operational`), Suricata NIDS (`sourcetype=suricata`), Fortigate UTM (`sourcetype=fgt_utm`) |

---

## Master Attack Chronology

| Timestamp (UTC) | Telemetry Source | Source Entity | Target Entity | Technical Event & Findings |
|---|---|---|---|---|
| **15:36:45** | IIS Web Logs / Stream | `40.80.148.42` | `192.168.250.70` | **Web Vulnerability Scanning:** Acunetix scanner probes web server directories and extensions. |
| **16:12:10** | IIS Web Logs | `23.22.63.114` | `/joomla/administrator` | **Credential Brute Force:** 412 HTTP POST login attempts testing common dictionary passwords (`12345678`, `baby`). |
| **16:44:22** | Sysmon EID 1 & 7 | `we8105desk` (`bob.smith`) | `AppData\Roaming\` | **Malware Execution & Masquerading:** Binary `osk.exe` executed. SHA256 hash confirms **Cerber Ransomware**. |
| **16:44:38** | Suricata NIDS | `192.168.250.100` | `54.148.194.58` (`ipinfo.io`) | **External IP Discovery:** Outbound HTTP request triggered `ET POLICY Possible External IP Lookup ipinfo.io`. |
| **16:45:02** | Fortigate UTM | `192.168.250.100` | `16,384 External IPs` | **C2 Botnet Communication:** Mass UDP port `6892` broadcast triggered Fortigate UTM alert `Cerber.Botnet`. |

---

## Phase-by-Phase Forensic Walkthrough

### Phase 1: Web Perimeter Reconnaissance & Brute-Force Exploitation

#### 1. The "Who, Why, & How"
- **Adversary Intent:** Identify vulnerabilities and exposed administration panels on the public web server `imreallynotbatman.com` (`192.168.250.70`), followed by brute-forcing administrative access to gain initial foothold or upload web shells.
- **Forensic Signal in Splunk:** Ingested web logs (IIS) record HTTP request methods, URIs, client IP addresses, user-agent strings, and HTTP response status codes. Automated scanners generate high-frequency requests with characteristic User-Agents or URI fuzzing patterns.

#### 2. SPL Query: Identifying Web Vulnerability Scanning

```spl
index=botsv1 sourcetype=iis dest_ip="192.168.250.70"
| stats count by src_ip, cs_User_Agent
| sort - count
```

- **Analysis:** IP `40.80.148.42` generated tens of thousands of rapid HTTP requests starting at `15:36:45`. The `cs_User_Agent` explicitly identified the automated scanner: **Acunetix Web Vulnerability Scanner**.

#### 3. SPL Query: Investigating Authentication Brute Force on Joomla

```spl
index=botsv1 sourcetype=iis cs_method=POST cs_uri_stem="*administrator*"
| stats count by src_ip, cs_uri_stem, sc_status
```

- **Findings:** A separate IP address (`23.22.63.114`) initiated **412 targeted POST requests** against `/joomla/administrator/index.php`.
- **Payload Inspection:** Extracting the POST body data revealed dictionary password attacks attempting trivial combinations (`12345678`, `admin123`, `baby`, `batman`) against the administrative portal.

---

### Phase 2: Endpoint Compromise & Malware Masquerading

#### 1. The "Who, Why, & How"
- **Adversary Intent:** Establish persistence and execute the malicious payload on internal workstations while evading user and antivirus detection.
- **The Technique (Masquerading - T1036.005):** The malware placed itself in the user roaming profile folder `AppData\Roaming\{GUID}\osk.exe`. It named its binary `osk.exe`, mimicking the legitimate Windows **On-Screen Keyboard** utility (which normally resides strictly in `C:\Windows\System32\osk.exe`).
- **Forensic Signal:** Sysmon **Event ID 1 (Process Create)** captures the abnormal execution path, while **Event ID 7 (Image Loaded / Module Load)** captures cryptographic file hashes (MD5, SHA256) of loaded binaries.

#### 2. SPL Query: Isolating the Compromised Endpoint & Binary

```spl
index=botsv1 sourcetype="XmlWinEventLog:Microsoft-Windows-Sysmon/Operational" EventCode=1 Image="*\\osk.exe"
| table _time host User ParentImage Image CommandLine
```

```text
+---------------------+------------+-------------------------+---------------------------------+-----------------------------------------------------------+
| _time               | host       | User                    | ParentImage                     | Image                                                     |
+---------------------+------------+-------------------------+---------------------------------+-----------------------------------------------------------+
| 2016-08-24 16:44:22 | we8105desk | WAYNECORPINC\bob.smith  | C:\Windows\explorer.exe         | C:\Users\bob.smith\AppData\Roaming\{35AC489F}\osk.exe     |
+---------------------+------------+-------------------------+---------------------------------+-----------------------------------------------------------+
```

- **Forensic Finding:** Host `we8105desk.waynecorpinc.local` (`192.168.250.100`) running under account `WAYNECORPINC\bob.smith` executed the masqueraded `osk.exe` payload from an unauthorized `AppData\Roaming` directory.

#### 3. SPL Query: Extracting Cryptographic Hashes for Threat Intel Triangulation

```spl
index=botsv1 sourcetype="XmlWinEventLog:Microsoft-Windows-Sysmon/Operational" EventCode=7 Image="*\\AppData\\Roaming\\*\\osk.exe"
| table _time Image Hashes
```

- **Extracted Hash:**
  - **SHA256:** `37397f8d8e4b3731749094d7b7cd2cf56cacb12dd69e0131f07dd78dff6f262b`
- **Threat Intelligence Attribution (VirusTotal):** Cross-referencing the SHA256 hash across global threat intelligence confirmed the binary as **Cerber Ransomware**, a notorious ransomware-as-a-service (RaaS) strain known for heavy evasion, audio ransom notes (`.vbs`), and UDP-based peer C2.

---

### Phase 3: Outbound Reconnaissance & External IP Discovery

#### 1. The "Who, Why, & How"
- **Adversary Intent:** Ransomware strains require knowledge of the infected machine's public WAN IP address and geographic location to calculate affiliate tracking codes, determine ransom currency pricing, and verify if the host is in an excluded region.
- **The Forensic Signal:** Rather than hosting custom infrastructure, the ransomware reaches out to legitimate public IP lookup services (e.g., `ipinfo.io`, `api.ipify.org`, `whatismyip.com`). Suricata NIDS monitors network taps and generates policy-violation alerts when internal hosts trigger automated external IP query signatures.

#### 2. SPL Query: Correlating Suricata NIDS Alerts

```spl
index=botsv1 sourcetype=suricata src_ip="192.168.250.100"
| table _time alert.signature alert.category src_ip dest_ip dest_port
```

```text
+---------------------+----------------------------------------------------+------------------+-----------------+---------------+-----------+
| _time               | alert.signature                                    | alert.category   | src_ip          | dest_ip       | dest_port |
+---------------------+----------------------------------------------------+------------------+-----------------+---------------+-----------+
| 2016-08-24 16:44:38 | ET POLICY Possible External IP Lookup ipinfo.io   | Policy Violation | 192.168.250.100 | 54.148.194.58 | 80        |
+---------------------+----------------------------------------------------+------------------+-----------------+---------------+-----------+
```

- **Forensic Finding:** Within 16 seconds of payload execution, `we8105desk` (`192.168.250.100`) initiated an HTTP GET request to `54.148.194.58` (`ipinfo.io`), generating an alert for automated IP location reconnaissance.

---

### Phase 4: Large-Scale C2 Botnet Communication & Firewall Triage

#### 1. The "Who, Why, & How"
- **Adversary Intent:** Cerber Ransomware utilizes a decentralized Command and Control mechanism. Instead of contacting a single centralized domain (which defenders can quickly sinkhole or blacklist via DNS), Cerber sends UDP datagrams containing encrypted host registration statistics across massive ranges of IP addresses.
- **Forensic Signal:** Next-Generation Firewalls (Fortigate UTM) track high-frequency outbound UDP connection attempts from internal hosts to external subnets and match traffic characteristics against threat intelligence signature databases.

#### 2. SPL Query: Analyzing Outbound UDP Beaconing & Destination Count

```spl
index=botsv1 sourcetype=fgt_utm srcip="192.168.250.100" dstport=6892
| stats dc(dstip) as unique_dest_ips, count by srcip, dstport, proto
```

```text
+-----------------+---------+-------+-----------------+-------+
| srcip           | dstport | proto | unique_dest_ips | count |
+-----------------+---------+-------+-----------------+-------+
| 192.168.250.100 | 6892    | udp   | 16384           | 16384 |
+-----------------+---------+-------+-----------------+-------+
```

- **Forensic Finding:** The infected host sent outbound UDP packets on port **`6892`** to exactly **16,384 unique IP addresses** (a full `/18` subnet space scan).

#### 3. SPL Query: Correlating Firewall Threat Category & UTM Signatures

```spl
index=botsv1 sourcetype=fgt_utm srcip="192.168.250.100" utmaction=*
| table _time srcip dstip dstport utmaction threat_name threat_category
```

```text
+---------------------+-----------------+--------------+---------+-----------+---------------+-----------------+
| _time               | srcip           | dstip        | dstport | utmaction | threat_name   | threat_category |
+---------------------+-----------------+--------------+---------+-----------+---------------+-----------------+
| 2016-08-24 16:45:02 | 192.168.250.100 | <Multiple>   | 6892    | blocked   | Cerber.Botnet | Botnet          |
+---------------------+-----------------+--------------+---------+-----------+---------------+-----------------+
```

- **Forensic Assessment:** Fortigate UTM identified the signature as **`Cerber.Botnet`** under the **`Botnet`** category, confirming active post-infection C2 telemetry broadcasts.

---

## MITRE ATT&CK Framework Mapping

| Tactic | Technique ID | Technique Name | Observation in Investigation |
|---|---|---|---|
| **Reconnaissance** | [T1595.002](https://attack.mitre.org/techniques/T1595/002/) | Active Scanning: Vulnerability Scanning | IP `40.80.148.42` using Acunetix against `imreallynotbatman.com`. |
| **Credential Access** | [T1110.001](https://attack.mitre.org/techniques/T1110/001/) | Brute Force: Password Guessing | IP `23.22.63.114` performing 412 POST attempts on `/joomla/administrator`. |
| **Defense Evasion** | [T1036.005](https://attack.mitre.org/techniques/T1036/005/) | Masquerading: Match Legitimate Name or Location | Malicious binary disguised as `osk.exe` in `AppData\Roaming\{GUID}\`. |
| **Discovery** | [T1016](https://attack.mitre.org/techniques/T1016/) | System Network Configuration Discovery | HTTP GET query to `ipinfo.io` (`54.148.194.58`) to resolve external IP. |
| **Command and Control** | [T1071.001](https://attack.mitre.org/techniques/T1071/001/) | Application Layer Protocol: Web Protocols | Port 80 external IP lookup for egress profiling. |
| **Command and Control** | [T1095](https://attack.mitre.org/techniques/T1095/) | Non-Application Layer Protocol | Mass UDP port 6892 beaconing across 16,384 external IPs. |
| **Impact** | [T1486](https://attack.mitre.org/techniques/T1486/) | Data Encrypted for Impact | Cerber Ransomware deployment on endpoint `we8105desk`. |

---

## SOC Detection & Response Playbook

### 1. High-Fidelity Detection Rules (Splunk SPL)

```spl
# Rule 1: Detect User-Space Binaries Masquerading as Core Windows Tools
index=main sourcetype="XmlWinEventLog:Microsoft-Windows-Sysmon/Operational" EventCode=1
| eval is_system_name=if(match(Image, "(?i)\\(osk|svchost|csrss|lsass|smss|services|taskhost)\.exe$"), 1, 0)
| eval is_system_path=if(match(Image, "(?i)^C:\\Windows\\(System32|SysWOW64)\\"), 1, 0)
| where is_system_name=1 AND is_system_path=0
| table _time host User Image CommandLine ParentImage

# Rule 2: High-Volume Outbound UDP Fan-out (Ransomware / Botnet C2)
index=firewall proto=udp
| stats dc(dst_ip) as unique_destinations by src_ip, dst_port
| where unique_destinations > 500
```

### 2. Immediate Containment & Incident Handling Actions
1. **Endpoint Isolation:** Disconnect `we8105desk` (`192.168.250.100`) from the network immediately via EDR network containment to halt file encryption and lateral propagation.
2. **Account Remediation:** Force password reset and revoke all active Kerberos/NTLM tokens for `WAYNECORPINC\bob.smith`.
3. **Firewall Egress Blocking:** Implement temporary outbound boundary firewall rules dropping all UDP traffic targeting port `6892` and sinkhole known Cerber subnet ranges.
4. **Web Tier Hardening:** Apply IP rate limiting on `/joomla/administrator/` and enforce Multi-Factor Authentication (MFA) to neutralize automated dictionary attacks.
