---
title: "Digital Evidence Acquisition — Memory Dumps, FTK Disk Imaging & Remote KAPE"
category: "BTL1 Practical Lab"
difficulty: "Intermediate"
date: 2026-08-31
summary: "Hands-on forensic data acquisition walkthrough: capturing full memory dumps & process memory (ProcDump), acquiring physical/logical disk images in Expert Witness Format (.E01) with FTK Imager, verifying MD5/SHA1 integrity hashes, and executing remote live artifact collection with KAPE."
tools: ["FTK Imager", "ProcDump (Sysinternals)", "KAPE (gkape)", "PowerShell", "RDP"]
published: true
---

## Scenario & Objectives

To establish a defensible forensic investigation, raw digital evidence must be acquired using forensically sound methodologies before passing artifacts to analysis suites such as Autopsy, EnCase, and Volatility.

This lab covers three core forensic acquisition pillars:
1. **Volatile Memory Acquisition:** Capturing full host physical memory and isolated process memory dumps (simulating active in-memory malware extraction).
2. **Bit-Stream Disk Imaging:** Creating forensic disk images in Expert Witness Format (`.E01`) with cryptographic hash verification.
3. **Targeted Live Triage:** Rapid remote artifact collection using Kestrel / KAPE over Remote Desktop (RDP).

---

## Task 1: Memory Acquisition (Full Memory & Targeted Process Dumps)

### 1. Full Physical RAM Capture (FTK Imager)
Volatile memory contains critical transient evidence: active network sockets, injected DLLs, unencrypted credentials, and running malware payloads.

1. Launch **FTK Imager** as Administrator.
2. Navigate to **File > Capture Memory**.
3. Specify destination path (`memdump.mem`) and include the pagefile if comprehensive analysis is required.
4. Execute capture to generate a raw `.mem` / `.raw` image for memory forensics in Volatility.

### 2. Isolated Process Memory Dump (Sysinternals ProcDump)
In active incident response engagements, investigators often need to dump the memory space of a specific malicious process rather than the entire multi-gigabyte RAM space.

```powershell
# Identify target process and Process ID (PID)
Get-Process | findstr -I "calc"
```

Once the PID is identified (e.g., `PID 1688`), execute **ProcDump** with the `-ma` flag (Write a dump file with all process memory):

```powershell
# Create full process memory dump
.\procdump.exe -ma 1688
```

This generates a `.dmp` file containing the complete virtual memory allocation of the target process, ideal for string extraction, shellcode disassembly, and in-memory credential recovery.

---

## Task 2: Bit-Stream Disk Imaging & Hash Verification (FTK Imager)

Forensic disk acquisition involves creating an exact, bit-by-bit duplicate of a storage drive while preventing any modification to the original media.

```text
Evidence Source (Physical Drive) ──► Write Blocker ──► FTK Imager Engine ──► Expert Witness Format (.E01)
                                                                       └──► Hash Verification (MD5 / SHA1)
```

### Step-by-Step Disk Imaging:
1. Open **FTK Imager** and select **File > Create Disk Image**.
2. Select **Source Evidence Type**: `Physical Drive` (captures unallocated clusters, slack space, and partition tables).
3. Select the target drive volume (e.g., secondary 20 GB forensic target).
4. Configure image destination:
   - **Image Type:** `E01` (Expert Witness Format — embeds case metadata, compression, and per-block CRC integrity checksums).
   - **Case Metadata:** Case Number, Evidence Number, Unique Description, Examiner Name.
   - **Image Destination & Fragment Size:** Specify target path and set fragment size (default `1500 MB` or single volume).
5. Start the imaging job and await completion.

### Cryptographic Hash Verification:
Upon completion, FTK Imager automatically calculates and compares the pre-acquisition and post-acquisition hashes:
- **MD5 Hash:** Computed and verified against physical disk blocks.
- **SHA1 Hash:** Computed and verified against physical disk blocks.
- **Bad Sectors:** Logged in the acquisition report (`.txt`).

> **Forensic Best Practice:** If the computed source hash and image hash match exactly, the evidence is legally defensible and proves zero data corruption or tampering occurred during transit.

---

## Task 3: Remote Live Artifact Triage with KAPE

**KAPE** (Kroll Artifact Parser and Extractor) enables rapid, targeted artifact triage from live systems in minutes rather than waiting hours for full multi-terabyte disk images.

### Remote Deployment Workflow:
1. Establish an RDP connection to the target remote host (`192.168.x.x`).
2. Transfer the standalone KAPE toolset to the remote environment.
3. Launch GUI wrapper (`gkape.exe`) and configure target acquisition options:
   - **Use Target Options:** Enabled (`--tsource C: --tdest Desktop\output`).
   - **Selected Targets:** `Browsers` (harvests Chrome, Edge, Firefox history, web cache, cookies, and installed extensions).
   - **Execution Flags:** Flush cache and execute automated copy using Volume Shadow Copy Service (VSS) to bypass OS file locks on active database files.

```text
gkape.exe --tsource C: --tdest C:\Users\btlo\Desktop\output --target Browsers --gui
```

4. Retrieve the structured `output` directory containing extracted SQLite databases (`History`, `Login Data`, `Extensions`) and transfer back to the forensic workstation for offline artifact parsing.

---

## Summary of Acquisition Tools & Forensic Standards

| Tool / Utility | Artifact Type | Output Format | Primary Use Case |
|----------------|---------------|---------------|------------------|
| **FTK Imager** | Physical / Logical Disk | `.E01` (EnCase) / `.raw` | Bit-stream disk imaging with embedded hashes & metadata |
| **FTK Imager** | Volatile RAM | `.mem` / `.raw` | Full host memory capture for Volatility / Rekall |
| **ProcDump** | Process Memory | `.dmp` (Minidump / Full) | Targeted process-level memory triage and malware dumping |
| **KAPE (gkape)** | Live Windows Artifacts | Structured Directories | Rapid live incident response, browser history, registry hives, prefetch |

---

## Key Takeaways & Defensive Best Practices

1. **Order of Volatility:** Prioritize capturing transient RAM and live process states before taking static storage images or shutting down systems.
2. **Cryptographic Integrity:** Always compute and document MD5/SHA-256 hashes immediately upon image completion to maintain strict Chain of Custody.
3. **Targeted Triage vs. Full Imaging:** While full disk images are necessary for deep file recovery and unallocated space analysis, tools like KAPE provide actionable intelligence in active enterprise triage scenarios within minutes.
