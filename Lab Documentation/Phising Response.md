**This section of the Phishing Analysis domain will require you to:**

- Demonstrate your ability to determine if emails are malicious or not based on experience and judgment.
- Demonstrate your ability to correctly categorize malicious emails based on context and artifact analysis.
- Conduct a full phishing investigation including detection, triage, and report writing stages.
- Correctly suggest appropriate defensive measures based on artifact analysis.

# SCENARIO
-----------------------------------------------------------------
you have been given a number of emails that have randomly been copied from employee mailboxes. It is your job to analyze the downloaded emails, identify if any are malicious, and conduct investigations and write reports for any that are deemed to pose a risk to the organization. Reports should include a list of artifacts, analysis activities and results, and suggested defensive measures which will be reviewed by senior analysts.


# STEP BY STEP Investigation 
------------------------------------------------------------------------------


**Question 1 - Which of the 5 emails have you identified as being malicious?**

This is arguably the longest question to answer because it requires us to investigate all of the five provided emails and apply our analysis skills to identify which two are malicious.

**Email One**

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/5cb8417d54e79194392f474121e1e07feab414b1de9d3aa600240cf327ba725d346d1536ae6e12c43a16dfae9571.PNG)

It is immediately clear that this email is highly suspicious:

- The sending address is set as ‘auto-confirm.info-amazon.co.uk (where info-amazon.co.uk is the domain, not amazon.co.uk), but we can see it’s actually coming from [QPE77756@mun.ca](mailto:QPE77756@mun.ca) - this definitely isn't Amazon
- Formating/styling is inconsistent - emails from huge brands such as Amazon are styled well, and do not use varying fonts
- The email is not addressed to a specific person which is often seen in legitimate emails, instead it is addressed to a generic recipient ‘Amazon user’
- The email features poor and incorrect grammar such as ‘Your ID’ (should be your account), and ‘From Amazon Store’
- Has an obvious call-to-action button, enticing the user to click on the link for the ‘Help Page - Refund Form’ (emails do use legitimate call-to-actions, but this is also a part of phishing with URLs)

We've found our first malicious phishing email!

**Email Two**

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/b9319fd06f75f7fdf6405d20bf08efd2937d52c658ea7db35aaf492bfb46e72da74b67b821d00df0793ae13fa463.PNG)

If you thought this email was malicious, you may be rushing your analysis. Let's consider a few points:

- Email is spam-themed, trying to convince non-technical users that they are going to get a portion of someone's lottery winnings
- The email is not addressed directly to the recipient, suggesting it is being mass-mailed to a large list of people
- There is a URL in the body, however it is not hyperlinked. A quick Google search tells us that ‘thescottishsun[.]co[.]uk’ is a legitimate news site, and is not malicious
- The email provides an email address to contact that is different from the sender

Based on this information, this email is not malicious. It should be classed as spam/scam as it is trying to convince recipients to send personal details to a Gmail address, using the story behind a legitimate news article regarding lottery winners in Scotland.

**Email Three**

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/b84844779cdc76783986f513835bcb9197473bd5ba9132bf976d6e2fadbd8477b8bab720505755d8b28242344766.PNG)

Let's start by noting down some key parts of this email:

- The sender is a Gmail address, despite the email claiming to be from the UK's National Health Service
- The image used in the email is a generic stock image and doesn't show any NHS or UK Government branding to match the theme of the email
- The email is addressed to a generic recipient ‘Sir/Madam’
- The email is telling the recipient to open the attached file (call-to-action)
- A sense of urgency is created to generate an emotional response using the sentence ‘If you do not act soon, we will give your slot to someone else’ - this is trying to make people act quicker than they can think
- The attachment is named ‘MALICIOUS ATTACHMENT REMOVED - SBT.txt’. This is extremely unlikely to be the name of the real attachment - some Email Gateways have the ability to strip out and replace attachments to let recipients know it was malicious.

As the attachment is just a text file, we can open it without fear of malicious code execution.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/1ccc38b28b364a6b5a484fde960e81ac8f0437c1a8d584b863866e277a23ac9b74bd80d88937f4ac706f9ee75538.PNG)

This informs us that the attachment was indeed malicious, and was actually an executable disguised as a PDF using the double extension ‘.pdf.exe’.

Here's our second malicious email, giving us the answer of ‘1, 3’. Let's look at the final two emails anyway for practice!

**Email Four**

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/35e4cedda338d5a309a4939bd79cb8104300ee0e1a23dc25cb2fa81a4c6348e87c5e189ba5ee14f87689b2c77308.PNG)

Based on the sender, styling, theme, and purpose of this email, we can classify this as spam/newsletter. The email is not using a real call-to-action despite a number of hyperlinks. Further analysis of the links could be conducted using tools such as URL2PNG or WHOis and reputation checks on the domain, however over time you'll learn to understand what is suspicious, and what is just spam.

**Email Five**

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/9141d85f99567b8d4232dcea98291b204cf87b8e6e936e4ea15be50deb77694d1d4d716bba598003d6b78fec1487.PNG)

As with email four, we are seeing the same techniques being used. While parts of this email seem suspicious, such as the Reply-to address having the name set as ‘dfsdf’ and the subject line is misleading to individuals that aren't familiar with cryptocurrencies or investing, this is another spam email trying to convince people to sign up to begin trading cryptocurrencies, and is not inherently malicious - although it should be avoided!

---

**Question 2 - First Malicious Email: What is the sending address?**

Opening Email One in Sublime Text and searching for (CTRL+F) ‘From’ we can find the sending email address, which is contained within the <> symbols at the end of the line (everything before this is just a friendly name that can be set as anything, only the final part matters!)

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/25dd77632c48891c888d02f7ef0b7a48e13963257c2ab366985d1a05bb6046280e07870a2a6c3bcafe94d31aae01.PNG)

---

**Question 3 - First Malicious Email: What is the subject line?**

A few lines below, or by searching for ‘Subject’ we can find the subject line.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/afca1cbf49afe2b0abfa21f9e4da31562f3af9b2248c0087bc21ac5359131d816c2da1781f1fbed85a4ac5ae2f4a.PNG)

---

**Question 4 - First Malicious Email: Who are the recipients?**

Looking at line 42 we can see the email is being sent to jack.tractive@abcindustries.co.uk.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/0e790697804cb7953086a0414a80111d4a3eeeebefae20ec5ccfe2cbefc1b92d4a6c603ec420864529e798ee8a9b.PNG)

---

**Question 5 - First Malicious Email: What is the Reply-to address? (If not present, write "none")**

Searching for ‘reply’ or ‘reply-to’ gives us no results, so we will enter the answer as ‘none’.

---

**Question 6 - First Malicious Email: What is the date and time the email was sent? (Retrieve this via text editor!)**

Searching for ‘Date’ in our text editor will show us the timestamp of the email.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/d7b6629db846d1c5a6472ab23b3bf730090c250979349a39dbd7ecc78411f4986aa1f2717f619d5ce374bd15f50b.PNG)

---

**Question 7 - First Malicious Email: What is the sending server IP?**

Searching for the string ‘Sender’ we can see a number of references to the same IP address, including a mention of SPF checks that came back positive for this IP.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/718e4eba21d2cf2abda4a862ac858d61a1110bc183e4597661b54c02d8ddd5066aea6c2f61757d4c9d681f73768f.PNG)

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/cc66a8c5a28b0ce2f0e42f83d0278a2ec23d92e433ea018903bfbf5c45d79e29ea22efe1c0fe80f6ab7cf1a0c49b.PNG)

---

**Question 8 - First Malicious Email: What is the reverse DNS hostname of the sending server IP? (check email headers and/or a WHOis lookup)**

Searching for the sender IP 68.114.190.29 on [https://whois.domaintools.com](https://whois.domaintools.com/) doesn't show us a hostname, and states that the IP is owned by ‘United States Ashburn Charter Communications’. It seems that this IP is no longer owned by an individual company, so we won't be able to get the hostname from here. While IP ownership can change, we'll always have the original information preserved within the email file.

Searching for the IP in the text editor we find the following information, giving us the hostname of the sending server:

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/1657d5f76bc19ea420b46677f56e24fd8ac4ab9ae4ee488e7e025a0573a203c688ff5498368613ba818225144b5f.PNG)

---

**Question 9 - First Malicious Email: What is the full URL?**

The easiest way to do this is by right-clicking the URL in the email when viewed through an email client, because email files can contain a lot of http/https links, making it time-consuming to go through them to find the right one.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/ed7704bec2f81bb35f63a1e882bc614a8c075265c3bc71e752db9e4966b3c8dc68fef9ae3a20ae9c078c2983e4d1.PNG)

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/00ac2c0303da4239d91c4d1e57fe4c6661875ec2380880bf797a530750bcf832bb84df496ee8ed833543835a79c0.PNG)

Based on the formatting of the URL and the theme/intent of the email, this is very likely to be a credential harvester, where the email address on the fake Amazon login screen is being auto-filled (to make it seem more legitimate) by the email argument provided in the URL. This is speculation until we investigate further, but over time you will learn to understand attacks based on themes and techniques used.

---

**Question 10 - Second Malicious Email: What is the sending address?**

Opening the email in a text editor, we'll use CTRL+F to search for the ‘From’ property.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/3117e611026b04b26d419231f9db0e4cf902bafebb7ec5d5c6a1b3b3baebb42147c6d9fc8dd4ddd47ce71aae569f.PNG)

---

**Question 11 - Second Malicious Email: What is the subject line?**

Looking down a few lines or searching for ‘Subject’ will give us the value.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/fd3b4a23f1403c6f871f03a5a419cfbedb38bf8042008c592efb20bd415329c020c6f280d0346faad071b46d969d.PNG)

---

**Question 12 - Second Malicious Email: Who are the recipients?**

Searching for the ‘To’ property we can find one recipient listed.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/adfd097e87536c87820e83a418e578f3851b04b873fb0231b9a09e07c052778b849af8cf21babf71fa794f3277a7.PNG)

---

**Question 13 - Second Malicious Email: What is the Reply-to address? (If not present, write "none")**

Searching for ‘Reply’ or ‘Reply-to’ shows no results, so this email is not using a reply-to address to receive replies.

---

**Question 14 - Second Malicious Email: What is the date and time the email was sent? (Retrieve this via text editor!)**

Searching for ‘Date’ will give us the timestamp of the email.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/a87d53023e21951e49200d8e165f100b0afb620a5320b00c3d2c396e9b134ce7c5261cb6acf6d2a0b827cda862df.PNG)

---

**Question 15 - Second Malicious Email: What is the sending server IP?**

Searching for ‘Sender’ we can find the sending server's IP address.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/3a9ca66725855bf0e7822d62160eb1d64cd76b1d4af67c67911db65e8c2429c46cf91fb0e8bbdea6d722432422f0.PNG)

---

**Question 16 - Second Malicious Email:  What is the reverse DNS hostname of the sending IP? (check email headers and/or a WHOis lookup)**

Searching for the IP address on Domain Tools WHOis lookup, we can see the resolved host is a Gmail sending server, owned by Google.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/457a05adc27ddc55d3c90e6e0e1c3eb20a54e3e5b2cfb7914bee2bc95b5314a00018a3daa028274a97a7d35f9c1d.PNG)

---

**Question 17 - Second Malicious Email: What is the file name, including extension?**

Typically we will retrieve the filename and extension that is shown in the email client (but can also be found in a text editor by looking through the body content at the end of the file). In this scenario we have ‘removed’ the malicious file, which some email gateways can do. In the below screenshot you can see our dummy attachment can be found within the eml file itself.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/fb62874dd5491dc35445b738d60844ab9b583067ecc0f5e149b071b39648b67e5a7d3c23b48267b9bfa75aaf7f18.PNG)

Looking in the Thunderbird client we can see the attachment shown at the bottom of the windows (however most email clients like Outlook and Gmail will display attachments at the top of an email).

In this scenario, we need to submit the ‘real’ name of the attachment that was removed by our email gateway, which can be found within the text file attachment.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/10d2476d5fdf85559b59d52056bccbd062660d93adb7ae0731757fba9e4d6696a3fd9d4d766f92770748b486edf7.PNG)

---

**Question 18 - Second Malicious Email: What is the SHA256 hash value of the file?**

If we were dealing with a real malicious attachment then we would want to download it within a virtual machine (that is only used for analysis and doesn't hold corporate data) and hash the file using PowerShell or Linux CLI (Get-FileHash vs sha256sum).

However in this fictional scenario, we're provided with the SHA256 hash, as we no longer have access to the real attachment (shown in the screenshot above).


# Artifacts and IOCs
-------------------------------------------------------------------------------
Email 1
from; QPE77756@mun.ca

to; jack.tractive@abcindustries.co.uk

date;  19 Apr 2017 12:35:58 +0000

received; from HE1P189CA0026.EURP189.PROD.OUTLOOK.COM (10.160.72.39) by AM5P18901MB0177.EURP189.PROD.OUTLOOK.COM (10.173.95.21) with Microsoft SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256_P256) id 15.1.1034.10 via Mailbox Transport; Wed, 19 Apr 2017 12:36:06 +0000

Reply-to ; Non

Subject; Your Amazon.co.uk order of "ION Audio Turntable."

Sender Ip - 68.114.190.29


Suspicious  URL - http://id820update.refundsys59.co.uk/invoice103amz/index.php?email=jack.tractive@abcindustries.co.uk

Analysis
Reverse DNS lookup (WHOIS) 
 - Server belongs to Greenwood Village Charter Communications Llc
  Resolver host - mtaout004-public.msg.strl.va.charter.net

Visual analysis
- URL2PNG showed a browser page so nothing there really
- Wannabrowser - Also couldn't resolve  a thing


Defensive measures 
Block the domain. 


----------------------------------------------

Email 2 
from ; FSDFAS2423N23K@gmail.com

TO; matthew.beaman@abcindustries.co.uk

Date;  12 Jun 2020 21:23:00 +0100

message ID : <CAEiZpzrTLgCr=gWKtg5JD3nY=t+Fx+4R+kbr0WbRx26Crk5pNQ@mail.gmail.com>

Received: from AM6EUR05FT066.eop-eur05.prod.protection.outlook.com (2a01:111:e400:fc11::47) by AM6EUR05HT101.eop-eur05.prod.protection.outlook.com (2a01:111:e400:fc11::303) with Microsoft SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id 15.20.3088.18; Fri, 12 Jun 2020 20:23:11 +0000

Subject : COVID19 - GET TESTED NOW!

Sender's IP : 209.85.160.173

Analysis;
Reverse DNS (WHOIS) - It is a google server
registered 0n Mar 30, 2000

Reputation - 58/70 malicious score
Trojain


Malicious attachment
SHA256 hash - 8b2e701e91101955c73865589a4c72999aeabc11043f712e05fdb1c17c4ab19a


# Tools
1. Notepad / Sublime text - for email artifacts like email header details
2. https://whois.domaintools.com - For Reverse DNS search on IP addresses
3. URL2PNG - For visualizing URLs to check for credential harvessters etc.
4. VirusTotal - for file artifacts e.g SHA256hashes

# REPORT 
# =============================== BTL1 Phishing Response Challenge

# =============================== Malicious Email #1 (Lowest ID Value)

[+] Email Artifacts:

  

> Brief description: Spoofed Amazon order confirmation email attempting credential harvesting by enticing the target to click a "Refund Form" call-to-action link. 
> 
> Sending address: QPE77756@mun.ca 
> 
> Subject line: Your Amazon.co.uk order of "ION Audio Turntable." 
> 
> Recipients: jack.tractive@abcindustries.co.uk 
> 
> Reply-to address: None 
> 
> Date and time sent (UTC): 19 Apr 2017 12:35:58 UTC 
> 
> Sending server IP: 68.114.190.29 
> 
> Reverse DNS result: mtaout004-public.msg.strl.va.charter.net
> 
>   

[+] Web Artifacts:

  

> Full URL: [http://id820update.refundsys59.co.uk/invoice103amz/index.php?email=jack.tractive@abcindustries.co.uk](https://www.google.com/search?q=http://id820update.refundsys59.co.uk/invoice103amz/index.php%3Femail%3Djack.tractive%40abcindustries.co.uk) 
> 
> Root domain: refundsys59.co.uk
> 
>  Analysis done: Visual analysis conducted via URL2PNG and WannaBrowser; the host failed to resolve/render. Analyzed URL structure as an active credential harvester.
> 
>   

[+] Defensive Measures:

  

> Email artifacts: Block the sending address `QPE77756@mun.ca` and domain on the Secure Email Gateway (SEG). Configure SEG rules to detect brand impersonation of Amazon.
> 
>  Web artifacts: Block the root domain `refundsys59.co.uk` and URL path across firewall, DNS, and web proxy filters.
> 
>   

# =============================== Malicious Email #2 (Highest ID Value)

[+] Email Artifacts:

  

> Brief description: Spoofed NHS COVID-19 notification creating urgency ("If you do not act soon...") to trick the user into executing a malicious file attachment. 
> 
> Sending address: FSDFAS2423N23K@gmail.com 
> 
> Subject line: COVID19 - GET TESTED NOW! 
> 
> Recipients: matthew.beaman@abcindustries.co.uk 
> 
> Reply-to address: None 
> 
> Date and time sent (UTC): 12 Jun 2020 20:23:00 UTC 
> 
> Sending server IP: 209.85.160.173 
> 
> Reverse DNS result: Google Mail Server (`mail-io1-f173.google.com`)
> 
>   

[+] File Artifacts:

  

> Full file name: MALICIOUS ATTACHMENT REMOVED - SBT.txt (Original payload delivered via double extension `.pdf.exe`) 
> 
> SHA256 hash value: 8b2e701e91101955c73865589a4c72999aeabc11043f712e05fdb1c17c4ab19a
> 
>  Analysis done: Reputation check (VirusTotal) yielded a 58/70 detection score, identifying the payload as a Trojan.
> 
>   

[+] Defensive Measures:

  

> Email artifacts: Block sender `FSDFAS2423N23K@gmail.com` at the SEG. Implement policy rules flagging public webmail domains claiming to be official healthcare entities. 
> 
> File artifacts: Add SHA256 hash `8b2e701e91101955c73865589a4c72999aeabc11043f712e05fdb1c17c4ab19a` to EDR and Antivirus blocklists. 
> 
> Enforce mail gateway policies to block double extension files (`.pdf.exe`) and executable attachments.

