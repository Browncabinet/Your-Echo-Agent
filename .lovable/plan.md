This is not where you paste the actual API key value. Glama is asking for the **schema** of environment variables your server needs.

Use this JSON instead:

```json
{
  "type": "object",
  "properties": {
    "ECHO_API_KEY": {
      "type": "string",
      "description": "Your Echo API key"
    },
    "ECHO_API_BASE": {
      "type": "string",
      "description": "Optional Echo API base URL"
    }
  },
  "required": ["ECHO_API_KEY"]
}
```

Then save/build. After that, Glama should ask you to provide the actual value for `ECHO_API_KEY` somewhere in the release/deploy settings.

If it has a separate “Environment variables” or “Secrets” value box, put:

```text
ECHO_API_KEY = eak_your_real_key_here
```

Do **not** paste the real key into the JSON schema field unless Glama specifically labels that field as the secret value field.