---
title: "Phishing Incident Response & Email Header Triage"
category: "BTL1 Practical Lab"
difficulty: "Intermediate"
date: 2026-08-17
summary: "Full-lifecycle phishing investigation: distinguishing malicious emails from spam/scams, raw RFC 822 email header extraction, reverse DNS lookup, credential harvester analysis, and VirusTotal trojan payload hashing."
tools: ["Sublime Text", "WHOIS (DomainTools)", "URL2PNG", "VirusTotal", "Thunderbird"]
published: true
---

## Overview & Objectives

This investigation covers the complete lifecycle of a Security Operations Center (SOC) phishing incident response triage:
- **Triage & Classification:** Evaluating raw email artifacts and determining intent (Malicious vs. Spam/Scam).
- **Header Forensics:** Parsing RFC 822 email headers to identify spoofed senders, relay hops, timestamps, and authentic origin IPs.
- **Payload & URL Analysis:** Extracting credential-harvesting links and analyzing malicious attachments disguised via double extensions (`.pdf.exe`).
- **Defensive Engineering:** Formulating actionable Secure Email Gateway (SEG), Firewall, and EDR blocklist rules to protect enterprise infrastructure.

---

## Incident Scenario

> **Security Operations Alert:** A batch of five suspicious emails was retrieved from employee inboxes. The objective is to analyze all artifacts, identify malicious campaigns posing an operational threat, extract Indicators of Compromise (IOCs), and produce a defensive mitigation report.

---

## Step-by-Step Investigation & Analysis

### Email Triage & Classification

#### Email 1: Credential Harvester (Amazon Order Impersonation) — **[MALICIOUS]**

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/5cb8417d54e79194392f474121e1e07feab414b1de9d3aa600240cf327ba725d346d1536ae6e12c43a16dfae9571.PNG)

**Key Indicators:**
- **Sender Spoofing:** Display header claims `auto-confirm.info-amazon.co.uk`, but the envelope sender is `QPE77756@mun.ca`.
- **Inconsistent Branding:** Uses unstandardized fonts and poor grammar (`Your ID`, `From Amazon Store`).
- **Targeting:** Addressed to generic `Amazon user`.
- **Call-to-Action:** Directs the user to an external refund page intended for credential harvesting.

#### Email 2: Lottery Advance-Fee Scam — **[NON-MALICIOUS / SPAM]**

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/b9319fd06f75f7fdf6405d20bf08efd2937d52c658ea7db35aaf492bfb46e72da74b67b821d00df0793ae13fa463.PNG)

**Analysis:**
- Generic spam soliciting personal details via a free Gmail address, referencing a legitimate Scottish news article. No malware payloads or active exploit links detected.

#### Email 3: NHS COVID-19 Trojan Delivery — **[MALICIOUS]**

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/b84844779cdc76783986f513835bcb9197473bd5ba9132bf976d6e2fadbd8477b8bab720505755d8b28242344766.PNG)

**Key Indicators:**
- **Sender Mismatch:** Originates from a public Gmail address (`FSDFAS2423N23K@gmail.com`) claiming to represent the UK National Health Service (NHS).
- **Psychological Urgency:** Creates artificial time pressure (*"If you do not act soon, we will give your slot to someone else"*).
- **Malicious Attachment:** SEG replaced original executable attachment with a quarantine notice. Analysis reveals a double-extension executable (`.pdf.exe`).

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/1ccc38b28b364a6b5a484fde960e81ac8f0437c1a8d584b863866e277a23ac9b74bd80d88937f4ac706f9ee75538.PNG)

#### Emails 4 & 5: Spam Newsletters & Crypto Marketing — **[NON-MALICIOUS / SPAM]**
- Standard marketing spam and cryptocurrency trade promotions; no embedded exploits or active weaponized payloads.

---

### Technical Artifact Extractions

#### Incident #1: Amazon Phishing Artifacts

| Parameter | Extracted Artifact / Value |
|---|---|
| **Sender Address** | `QPE77756@mun.ca` |
| **Recipient** | `jack.tractive@abcindustries.co.uk` |
| **Subject** | `Your Amazon.co.uk order of "ION Audio Turntable."` |
| **Timestamp** | `19 Apr 2017 12:35:58 +0000` |
| **Originating IP** | `68.114.190.29` |
| **Reverse DNS** | `mtaout004-public.msg.strl.va.charter.net` |
| **Phishing URL** | `http://id820update.refundsys59.co.uk/invoice103amz/index.php?email=jack.tractive@abcindustries.co.uk` |
| **Root Domain** | `refundsys59.co.uk` |

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/25dd77632c48891c888d02f7ef0b7a48e13963257c2ab366985d1a05bb6046280e07870a2a6c3bcafe94d31aae01.PNG)

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/00ac2c0303da4239d91c4d1e57fe4c6661875ec2380880bf797a530750bcf832bb84df496ee8ed833543835a79c0.PNG)

---

#### Incident #2: NHS COVID-19 Trojan Delivery Artifacts

| Parameter | Extracted Artifact / Value |
|---|---|
| **Sender Address** | `FSDFAS2423N23K@gmail.com` |
| **Recipient** | `matthew.beaman@abcindustries.co.uk` |
| **Subject** | `COVID19 - GET TESTED NOW!` |
| **Timestamp** | `12 Jun 2020 20:23:00 UTC` |
| **Originating IP** | `209.85.160.173` (Google Mail Server `mail-io1-f173.google.com`) |
| **Payload Name** | `COVID19_TEST_FORM.pdf.exe` (Disguised via double extension) |
| **SHA256 Hash** | `8b2e701e91101955c73865589a4c72999aeabc11043f712e05fdb1c17c4ab19a` |
| **VirusTotal Detection** | **58/70 Security Vendors** (Identified as Trojan payload) |

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/3117e611026b04b26d419231f9db0e4cf902bafebb7ec5d5c6a1b3b3baebb42147c6d9fc8dd4ddd47ce71aae569f.PNG)

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/10d2476d5fdf85559b59d52056bccbd062660d93adb7ae0731757fba9e4d6696a3fd9d4d766f92770748b486edf7.PNG)

---

## Indicators of Compromise (IOCs)

| Indicator | Type | Threat Classification / Context |
|---|---|---|
| `QPE77756@mun.ca` | Email Address | Malicious Phishing Sender (Spoofed Amazon) |
| `FSDFAS2423N23K@gmail.com` | Email Address | Malicious Trojan Delivery Sender (Spoofed NHS) |
| `68.114.190.29` | IPv4 Address | Malicious Mail Relay / Host Server |
| `refundsys59.co.uk` | Domain | Credential Harvesting Infrastructure |
| `8b2e701e91101955c73865589a4c72999aeabc11043f712e05fdb1c17c4ab19a` | SHA256 Hash | Trojan Binary (`.pdf.exe`) |

---

## Defensive Engineering & Recommendations

### 1. Secure Email Gateway (SEG) Controls
- **Domain & Sender Blocking:** Blacklist `QPE77756@mun.ca`, `FSDFAS2423N23K@gmail.com`, and the `refundsys59.co.uk` root domain.
- **Attachment Enforcement:** Implement strict policy rules blocking executables disguised via double extensions (e.g., `*.pdf.exe`, `*.doc.exe`).
- **Brand Protection:** Configure rules to flag external emails from non-official domains that impersonate major service providers (Amazon, NHS, Microsoft).

### 2. Network & DNS Layer Defense
- **DNS Sinkholing / Web Proxy:** Block domain `refundsys59.co.uk` and URL paths associated with the credential harvester across perimeter firewalls and DNS resolvers.
- **IP Reputation Filtering:** Rate-limit and filter traffic originating from low-reputation mail relays.

### 3. Endpoint Detection & Response (EDR)
- **Hash Blocklist:** Distribute SHA256 `8b2e701e91101955c73865589a4c72999aeabc11043f712e05fdb1c17c4ab19a` to enterprise EDR agents to terminate any execution attempts.
- **User Awareness:** Provide targeted phishing simulations reinforcing caution around unexpected urgency lures and invoice refund links.
