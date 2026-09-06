Week starting: 31st August 2026

# What I worked on

#### BTL1:
- Digital Evidence collection equipment e.g Forensic Laptops with popular Linux  distributions like CAINE or DEFT etc, Electro static evidence bags with tamper proof stickers, Digital cameras, Grounding Bracelets, Write blockers, blank drives etc.
- Covered the chain of Custody 
- Disk Imaging using FTK imager and did a Number of labs of various windows artifacts from programs, Browsers, Recycle bin, Security Event Logos like Logon events and Event IDs
- Live forensics using KAPE to collect key artifacts from remote machines

#### CDSA:
- Finally knocked out Windows Event logging and finding  evil. I covered and learned the following things;

- **Windows Event Logs:** Basics of Event Log structure, identifying key logs for investigations, and utilizing them for threat detection.
    
- **Log Analysis & Tools:** Hands-on log analysis techniques, including using the `Get-WinEvent` PowerShell cmdlet with filters to simplify analysis.
    
- **Threat & Behavior Detection:** Using Sysmon and Event Logs to spot malicious activities such as DLL hijacking, uncontrolled PowerShell/C-Sharp injection, and credential dumping.
    
- **Event Tracing for Windows (ETW):** Architecture and components of ETW, with a focus on detecting evasive attacks like unusual parent-child process relationships and malicious .NET assembly loading.
Badge: https://academy.hackthebox.com/achievement/badge/a5e23fc7-a913-11f1-82d1-bea50ffe6cb4

- Started on Introduction to threat hunting and hunting with elastic.
- Knocked out the six boxes backlog (Sherlocks)

# KEY Takeaways
- I got a good understanding of disk Imaging and used FTK imager which was interesting, understood the   key  artifacts to look out for in windows  machine investigation and the use of KAPE for collecting artifacts remotely.
- Got a good understanding of windows log basics and how to stop malicious activity and other IOCs. Learnt the source of logs, their structure, and the various event IDs for Sysmon and the use of tools like Get-WinEvent powershell cmdlet for easy log filtering.
- Gained more confidence with sherlocks since i was able to knock out six as planned form last week. We keep pushing.

# Challenges and Friction.
- Learning about logs is a bit overwhelming and complex. I got confused a number of times and still need to interact with them a lot to get comfortable.
- For BTL1 the DFIR module is also super technical so i had to move quite slowly hence its been 2 weeks and i still haven't  knocked it out.

# Looking Forward 
- Knock out the DFIR module
- Push threat Hunting and hunting with elastic 