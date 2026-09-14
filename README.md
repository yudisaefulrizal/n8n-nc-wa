# n8n-nodes-nc-wa

An [n8n](https://n8n.io) community node for **NC-WA**, a self-hosted WhatsApp
gateway built on [Baileys](https://github.com/WhiskeySockets/Baileys).

NC-WA runs on your own server and exposes a REST API. This node lets n8n
workflows talk to it without hand-writing HTTP Request nodes.

> **Early release (0.1.0).** Only *Send Text* is implemented so far.
> Media, presence, session management and an incoming-message trigger are
> planned. See [ROADMAP.md](ROADMAP.md).

## What you need

- An n8n instance where you can install community nodes (self-hosted, or
  Cloud on a plan that allows them)
- A running NC-WA gateway and its API key

You can install this node without a gateway — it will appear in the node
panel and open normally. It only fails when a workflow actually runs.

## Installation

In n8n: **Settings → Community nodes → Install**, then enter:

```
n8n-nodes-nc-wa
```

## Credentials

Create an **NC-WA Gateway API** credential:

| Field | Value |
| --- | --- |
| Base URL | Address of your gateway, e.g. `https://wa.example.com` |
| API Key | The `API_KEY` value from your gateway's `.env` |

The key is sent as an `X-API-Key` header. Use the credential's **Test**
button to confirm n8n can reach the gateway.

If your gateway is reachable from the internet, put it behind HTTPS — the
API key travels in plain text otherwise.

## Operations

### Message → Send Text

| Field | Notes |
| --- | --- |
| Session ID | The session in your gateway that sends the message |
| To | International number without `+` (e.g. `628123456789`), or a group ID ending in `@g.us` |
| Text | Message body |

Returns the gateway's response, for example:

```json
{ "messageId": "3EB0...", "to": "628123456789@s.whatsapp.net" }
```

## Errors

Gateway errors are passed through as-is so you can read them in n8n. Common
ones:

| Error | Meaning |
| --- | --- |
| `unauthorized` | API key missing or wrong |
| `invalid_request` | Bad number format, or a missing field |
| `session_not_connected` | That session has not been paired yet |

Enable **Continue On Fail** if you would rather receive the error as an item
than stop the workflow.

## Compatibility

Tested against n8n 2.30. Requires Node.js 20.15 or newer.

## Resources

- [NC-WA gateway](https://github.com/yudisaefulrizal/NC-WA)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)
