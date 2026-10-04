# n8n AI Research Agent

An n8n workflow that takes a topic from a chat message, searches the live web, and emails you a cited research report as a Word document.

Type `AI trends this week` into the chat, and a couple of minutes later you get an email with the full report in the body and a `.doc` file attached.

## How it works

```
Chat message
   -> instant reply in chat ("Researching ... report will arrive by email")
   -> AI Agent (OpenAI + Tavily web search + short-term memory)
   -> Markdown to HTML
   -> Code node builds a Word-compatible .doc file
   -> Gmail sends the report (HTML body + .doc attachment)
```

## Features

- Real-time web research through Tavily search (recent sources, with publish dates)
- Fixed report structure: Executive Summary, Key Findings, Latest Developments, Conflicting Information, Risks and Open Questions, Sources
- Source rules: reputable outlets only, press releases labelled as vendor claims, full URLs only
- Report delivered as email body plus a Word-compatible `.doc` attachment
- Immediate chat reply so the chat window does not time out during the 2-minute run

## Requirements

- n8n (Cloud or self-hosted)
- OpenAI API key
- Tavily API key (tavily.com, free tier available)
- A Gmail account connected through n8n's Google sign-in

## Setup

1. In n8n, open the workflow menu and choose **Import from File**, then select `workflow/ai-research-agent.json`.
2. Re-create the credentials on these nodes (n8n never exports secret keys):
   - **OpenAI Chat Model**: your OpenAI API key
   - **Tavily MCP**: your Tavily API key
   - **Send a message** (Gmail): sign in with Google
3. In the Gmail node, set **To** to your own email address.
4. Check that the system message and code match the files in this repo (see below).
5. Open the chat, send a topic, and wait for the email.

## Node settings

| Node | Setting |
|---|---|
| When chat message received | Response Mode: **Using Response Nodes** |
| Chat -> Send a message | Message: `Researching "{{ $json.chatInput }}". The Word report will arrive in your email in about 2 minutes.` Wait for User Reply: off |
| AI Agent | System Message: contents of `prompts/system-message.txt`. Max Iterations: 12 |
| Simple Memory | Context Window Length: 3 |
| Markdown | Mode: Markdown to HTML. Markdown: `{{ $json.output }}`. Destination Key: `data` |
| Code in JavaScript | Mode: Run Once for All Items. Code: `code/build-word-doc.js` |
| Send a message (Gmail) | Subject: `{{ $json.title }}`. Email Type: HTML. Message: `{{ $('Markdown').item.json.data }}`. Attachments, field name: `data`. Append n8n Attribution: off |

## Repo layout

```
workflow/ai-research-agent.json    exported n8n workflow
prompts/system-message.txt         AI Agent system message
code/build-word-doc.js             Code node that builds the .doc file
docs/                              screenshots
```

## Known limits

- The `.doc` file is HTML saved with a `.doc` extension. Word opens it correctly but may show a Protected View or format warning. Click Enable Editing.
- A run takes about 2 minutes and uses many tokens because search results are passed back to the model on every step. Using a smaller model and a lower Max Iterations reduces cost.
- The Tavily MCP connection only accepts `topic: "general"`, so recency comes from `time_range` and dates in the query text.
- Citations come from the model. Open the links before relying on a claim.

## Roadmap

- Form Trigger with topic, time range and focus dropdowns
- Link checker that removes dead or invented URLs
- Fact-check pass before the report is built
- Scheduled weekly reports from a Google Sheet of topics
- Error alert workflow
- Native `.docx` export

## License

MIT, see `LICENSE`.
