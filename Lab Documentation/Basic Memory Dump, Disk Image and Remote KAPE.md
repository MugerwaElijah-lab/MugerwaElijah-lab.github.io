## **Scenario**

To strengthen your understanding of basic digital data acquisition, you will be using FTK Imager to take a disk image, a memory dump, and then using KAPE to collect key artifacts from a remote system. This lab will help you understand some of the ways these files can be gained before they are passed to analysis tools such as Autopsy, EnCase, and Volatility. This lab is just focused on demonstrating acquisition, you'll perform actual analysis in the other labs within this domain.

---

## **Task One: Memory Dump (15 minutes)**

For your first task, you'll be using FTK Imager to capture memory from your analysis host so that you understand the steps required in memory acquisition.

Open FTK Imager, which is found in the Acquisiton Tools folder on the Desktop. Go to File > Capture Memory. For the Destination path, we can simply set this as the Desktop!

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/7f9a6fe9ca089e7998ac7d81f26142660ba3e0482c9d0831ec562f2d2d349c6d543886e2905236d11a2a48824743.png)

Once this has finished, we can delete the memdump file from our Desktop.

Next let's try a different way to acquire a memory image of a specific process, something that's more aimed towards digital forensics and incident response (DFIR). ProcDump is a system administrator tool that is in the Sysinternals suite of tools from Microsoft!

Search for 'PowerShell' in the Start menu, right-click Windows PowerShell, and select Run as Administrator. Use the following command to navigate to the Acquisition Tools folder:

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/8afc3cde75b2270feea5106bf4353f477bfeb0c9045cb94cc29d7be32ddc2a3c4e9a44233ac237e531f190f69a34.png)

Next, launch the Calculator application from the Start menu, or simply type 'calc' into PowerShell. The command Get-Process will provide us with a list of all running processes on the system, along with useful information, including the associated Process ID (or PID). This will give us lots of results, so let's change our command to take the output from Get-Process, and search for the string 'calc' to only show the information we want -.`Get-Process | findstr -I calc`

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/c3c4ed110d7d75e1b214327bc411c36059028b7a142a6ff2aa4c24710bfcf49f978678002993114430b39c1f3297.png)

In this row of output, the value 1688 is the PID for calc.exe. If you want to see the column headers, you can run Get-Process to better understand what values are being shown. Now that we have the PID, we can use ProcDump to create a full memory dump of this process. Run the command`.\procdump.exe -ma 1688`

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/432512fcbc1302a93f64c39a83c5c2d6d141e4d37c0a0b8701febc5a43aa7365a25855a3daa2dab8c81892688ab6.png)

A .dmp file has now been created in this folder! We can once again delete the memdump file. In this example we used calculator because it's quick and simple, however imagine you're in an incident response engagement, and instead of dumping the memory of calc, you're taking an image of malware running on a system!

You'll get the chance to perform some memory analysis tasks in the Volatility section of this domain!

---

## **Task Two: Disk Image (15 Minutes)**

We're not going to get you to take a 1 terabyte hard disk image, because we don't hate you. In this short and sweet task, you'll use FTK Imager to take a disk image from a secondary 20 GB storage volume attached to the analysis machine. This will ensure you become familiar with the steps required to take a disk image using Autopsy.

Launch FTK Imager from the Acquisition Tools folder, and when ready, go to File > Create Disk Image. We'll be asked to select the Source Evidence Type, which for this example will be a Physical Drive.

When asked to select the drive to be imaged, we want to select the drive that is 21 GB in volume.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/29e0ba9a75cd8113633705557f47f2fd7d2379a04a473fb8a29d1d620a93fd8573b7cf78bc4a8bfead3d19286191.png)

Next we need to select the output destination for the file. Click Add and change the format type to a .E01 file. This filetype is used by analysis tools, such as the enterprise-grade forensics triage software EnCase.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/899d2df6599dad4d9f44297f604e9913456fabb5477eefae05efbfc10d296b88451a5f6f92a1a79da52b8a4b2acf.png)

You'll be asked to provide details about the case. We're going to leave this blank, but feel free to fill it out if you want!

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/c4dc6d7764e6be1d5f1865860f8eee2834c6c4e3236fb427f8fa5d54a9a3f7da20c74768c57dd05c700f9dc41510.png)

And finally, we're asked to select the output location and output filename. We've set this to our Desktop, the the name 'DiskImage'.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/ecf8a5255493f39b817d2a2d4648bf4f945c97ef72d5ab9c355733c95360ed46331e587bc861993fd8c680dbb2b2.png)

After clicking Finish, you'll be able to click Start on the main window. You can now watch the progress bar patiently as the disk is imaged! Remember we talked about hashing and integrity in an earlier lesson? Once the disk image is complete, FTK Imager will provide us with hash values for integrity purposes, so in the future we can ensure that the disk image, or any copies, are the exact same as when it was acquired. This allows us to prove or disprove claims of data corruption or tampering.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/4d9e7d3605281c2ca7a8cccecb2e83649ec636f392c4527aaa3a21faafa3aa318c06257c579db2574780060a6873.png)

You'll get the chance to perform some hard drive analysis tasks in the Autopsy section of this domain!

---

## **Task Three: Remote KAPE (20 Minutes)**

There are many ways that KAPE can be used to automatically collect artifacts on a remote host. For this example, you'll be connecting to a remote system using RDP, taking KAPE with you using the RDP clipboard, collecting key artifacts, then taking the output back to your analysis machine.

Time to jump over to our remote host - you'll find the private IP address for this at the top of this tab (Instructions) on the lab client. Open up Remote Desktop from the Windows start menu and enter in the IP address, along with the username 'btlo' and password 'btlo'.

Once connected, minimise the RDP window and find the KAPE folder inside Acquisition Tools on the Desktop. Copy this folder, open the RDP window again, and paste KAPE on the Desktop of the remote host (the lab may claim this transfer will take hours, but ignore it, Windows is being stupid!). Open the folder, then open gkape. We're going to set the following settings to retrieve some key artifacts from this host:

- Click the toggle box for 'Use Target options'
- Target source - Click the ... and select the C drive of the host
- Target destination - Click the ... and select the Desktop, then make a new folder called 'output' and select it
- Targets - Click the magnifying glass icon and search for 'browser' select Chrome and Chrome extensions
- Click the Execute button in the bottom right-hand corner!

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/794a3a1d02aa9d599ff088aa0ee50872dafe43616373b626b6781ca016ce0f9f80f9e979253e55549ef5f98f0dac.png)

We'll get a warning prompt about overwriting data, we can just click OK. When KAPE has finished you'll see the following window:

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/b7318d955551a1e1e1fee5d547c5e18ff68014422037e83b0704d9a03c40ac589056de64a51c2ba09a528cb697d2.png)

Close this command prompt, and close gkape. Inside the output folder we can follow the sub-folders to find the artifacts KAPE has retrieved for us.

![](https://d2y9h8w1ydnujs.cloudfront.net/uploads/content/images/146f929d05d7cca4022b6164c0dc8fbb1b7401bdad2c59b79b4be057ee29f8262169d9f2559b905051e86bb00f25.png)

Time to grab our files and head home! Copy the output folder, minimise the RDP session, and paste the folder onto our Desktop! Congratulations, you've finished the lab! Head over to the questions page to finish up.












