**C.A.S.P.E.R. — Central Assistant for Strategic Priorities & Expert Response**

---

## Overview

C.A.S.P.E.R. is a fully local, voice‑controlled AI assistant designed to manage and enrich a personal Obsidian knowledge base. It enables users to search notes via natural language, create interlinked folders and notes on demand, automatically groom notes with semantic wikilinks and smart summaries, and receive a daily email brief. The system runs entirely on the user’s machine, uses free/open‑source components, and can be controlled from a web interface (Open WebUI) or remotely via WhatsApp. It represents a complete local‑first alternative to cloud AI assistants.

---

## Architecture

The system is built around a central **Flask‑based bridge server** that integrates all components:

```
Obsidian Vault ↔ MCP Bridge (Flask)
                    ├── Ollama (local LLM: gemma3:4b, llama3.2:3b)
                    ├── Sentence‑Transformers (all‑MiniLM‑L6‑v2) for embeddings
                    ├── Langflow (prototyping & scheduled workflows)
                    ├── Open WebUI (local chat interface with slash commands)
                    ├── Pandoc + wkhtmltopdf (PDF generation)
                    ├── Twilio WhatsApp Sandbox + ngrok (remote control)
                    └── Windows Task Scheduler (automated daily brief)
```

The bridge exposes REST endpoints for each capability, allowing multiple front‑ends (Open WebUI, WhatsApp) to call the same underlying logic. Langflow is used primarily for prototyping and visual flow design; production logic runs directly in the bridge for speed and reliability.

---

## Key Features

| Command | Function | Description |
|---------|----------|-------------|
| `/search` | Vault Q&A | Retrieval‑Augmented Generation (RAG) answers questions using only the user’s notes |
| `/architect` | Knowledge Creation | Creates folders and graduate‑level, interlinked notes from a natural language command |
| `/groom` | Note Enrichment | Adds semantic `[[wikilinks]]` and appends a Smart Summary to any note in the vault |
| `/morningbrief` | Daily Email PDF | Summarises notes modified in the last 24 hours into a styled PDF and emails it |
| `/reindex` | Index Rebuild | Rebuilds the vault’s embedding index for search |
| `/backup` (planned) | OneDrive Backup | Copies the vault to OneDrive on demand |

All commands work from both **Open WebUI** and **WhatsApp** (via Twilio sandbox).

---

## Technologies Used

**AI / Inference**  
- Ollama (local LLM serving)  
- Models: `gemma3:4b`, `llama3.2:3b`  
- Sentence‑Transformers (`all‑MiniLM‑L6‑v2`) for embeddings  

**Orchestration & Prototyping**  
- Langflow (visual flow builder)  

**Interface & Control**  
- Open WebUI (local chat UI, custom tools and slash commands)  
- Twilio WhatsApp Sandbox + ngrok (remote messaging)  

**Backend & Integration**  
- Flask (bridge server)  
- Python 3.11 / 3.13  

**Document & Automation**  
- Pandoc + wkhtmltopdf (PDF generation)  
- Windows Task Scheduler (scheduled tasks)  
- Batch scripting (startup control)  

**Knowledge Base**  
- Obsidian (Markdown vault)  

---

## Implementation Stages

1. **Core Pipeline (Langflow)**  
   Built a five‑node flow (Watcher → Groomer → Director → Publisher → Syncer) that monitors an Obsidian vault for `#casper-sync`‑tagged notes, enriches them with wikilinks and Smart Summary, generates ELIV Focus Instructions, creates a PDF, and logs the run.

2. **Morning Brief & Email**  
   Developed a separate Langflow flow to collect notes modified in the last 24 hours, summarise them, generate a PDF, and email it. Scheduled via Windows Task Scheduler.

3. **RAG & Vault Architect**  
   Created a local RAG system using sentence‑transformers and a JSON index. Added the Architect component to create folders and notes from natural language commands.

4. **Open WebUI Integration & MCP Bridge**  
   Discovered that Langflow’s Chat Input component was unreliable for API calls; replaced it with a standalone Flask bridge that directly executes RAG, Architect, Grooming, and Morning Brief logic. Added custom tools and slash commands in Open WebUI to call the bridge.

5. **WhatsApp Control & Auto‑Start**  
   Exposed the bridge via Twilio WhatsApp Sandbox using ngrok. Implemented asynchronous replies (placeholder + real answer). Created a batch script to launch all services with one click and stop them when closed.

6. **Cold‑Start Resilience & Maintenance**  
   Added internet‑wait loops, Ollama readiness checks, model pre‑warming, and automatic retries to eliminate first‑request timeouts. Implemented `/reindex` to keep the search index fresh.

---

## Challenges Overcome

- **Langflow field incompatibility** – replaced Chat Input with direct `MessageTextInput` fields and eventually moved core logic to a standalone bridge.
- **PDF formatting issues** – disabled YAML metadata parsing and sanitised wikilinks for clean PDF output.
- **Cold‑start timeouts** – added pre‑flight checks and retry logic.
- **WhatsApp async response** – used Twilio API to send placeholder and follow‑up messages.
- **Note retrieval in subfolders** – modified groomer to search recursively.

---

## Results & Impact

- Fully functional local AI assistant with **zero recurring cost** and complete data privacy.
- Ability to create, enrich, and query an Obsidian vault from a web chat or from anywhere via WhatsApp.
- Daily automated PDF briefs delivered to email.
- Scalable architecture: new commands can be added by extending the bridge and creating corresponding Open WebUI tools.

---

## Future Enhancements

- Add `/studyplan` command for 7‑day curriculum generation.
- Implement `/backup` for OneDrive sync.
- Upgrade to a more powerful local model (e.g., Gemma 4 26B MoE) when hardware permits.
- Build a simple web dashboard for monitoring services and recent activity.
- Consider Docker‑based deployment for easier setup on other machines.

---

*Generated by C.A.S.P.E.R. – your local AI assistant.* 👻