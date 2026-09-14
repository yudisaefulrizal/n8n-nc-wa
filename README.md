# n8n-nodes-nc-wa

An [n8n](https://n8n.io) community node for **NC-WA**, a self-hosted WhatsApp
gateway built on [Baileys](https://github.com/WhiskeySockets/Baileys).

NC-WA runs on your own server and exposes a REST API. This node lets n8n
workflows send messages, manage sessions, and react to incoming messages
without hand-writing HTTP Request nodes.

## What you need

- An n8n instance where you can install community nodes (self-hosted, or
  Cloud on a plan that allows them)
- A running NC-WA gateway and its API key

You can install this node without a gateway — it appears in the node panel
and opens normally. It only fails when a workflow actually runs.

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

## Nodes

### NC-WA

**Message**

| Operation | What it does |
| --- | --- |
| Send Text | Send a plain text message |
| Send Media | Send an image, document, audio or video from a public URL |
| Send Typing | Show a typing, recording, or paused indicator |
| Mark as Read | Mark one received message as read |

**Session**

| Operation | What it does |
| --- | --- |
| Create | Create a new session |
| Get | Get details of one session |
| Get Many | List every session, one item each |
| Get QR Code | Fetch the QR code used to pair a session |
| Reconnect | Reconnect a session that dropped |
| Log Out | Log out without deleting the session |
| Delete | Delete a session and its stored credentials |

Numbers are written in international format without a leading `+`
(`628123456789`). Groups use their group ID, ending in `@g.us`.

Media is sent by URL: your gateway downloads it, so the URL must be
reachable from the gateway server.

### NC-WA Trigger

Starts a workflow when your gateway posts an event.

| Event | Fires when |
| --- | --- |
| Message Received | A message arrives from a contact or group |
| Session Status Changed | A session connects, disconnects, or logs out |
| QR Code Updated | A new QR code is ready to scan |

Options let you accept only one session, or skip group messages.

**Setup:** nothing to configure. When you activate the workflow, the trigger
registers its own URL with your gateway through the `/webhooks` API, and
removes it again when you deactivate. While testing in the editor, press
*Listen for test event* — the test URL is registered the same way.

Registering is safe to repeat, so re-activating a workflow will not leave
duplicate subscriptions behind.

If your gateway predates the `/webhooks` API, activation still works: copy
the Production URL into `WEBHOOK_URL` in the gateway's `.env` and restart it,
as before.

Incoming messages arrive flat:

```json
{
  "event": "message",
  "sessionId": "my-session",
  "messageId": "3EB0...",
  "from": "628123456789",
  "isGroup": false,
  "groupId": null,
  "sender": "628123456789",
  "type": "text",
  "text": "hello",
  "timestamp": 1757900000,
  "media": null
}
```

## Migrating from WAHA

Field names differ, so expressions need updating:

| WAHA | NC-WA |
| --- | --- |
| `$json.payload.from` | `$json.from` |
| `$json.payload.id` | `$json.messageId` |
| `$json.payload.participant` | `$json.sender` |
| `chatId` (`628…@c.us`) | `to` (`628…`, plain number) |
| Start Typing / Stop Typing | Send Typing with a **State** of Typing or Paused |

## Errors

Gateway errors pass through as-is. Common ones:

| Error | Meaning |
| --- | --- |
| `unauthorized` | API key missing or wrong |
| `invalid_request` | Bad number format, or a missing field |
| `session_not_found` | No session with that ID |
| `session_not_connected` | That session has not been paired yet |

Enable **Continue On Fail** to receive the error as an item instead of
stopping the workflow.

## Compatibility

Tested against n8n 2.30. Requires Node.js 20.15 or newer.

## Resources

- [NC-WA gateway](https://github.com/yudisaefulrizal/NC-WA)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)
