import urllib.request
import json
import time

url = "https://integrate.api.nvidia.com/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer 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"
}
data = {
    "model": "meta/llama-3.1-70b-instruct",
    "messages": [{"role": "user", "content": "What is the financial status?"}],
    "tools": [{
        "type": "function",
        "function": {
            "name": "get_financial_stats",
            "description": "Stats",
            "parameters": {"type": "object", "properties": {}}
        }
    }],
    "max_tokens": 1024
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
start = time.time()
try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Time:", time.time() - start)
        print(response.read().decode())
except Exception as e:
    print(e)
    if hasattr(e, 'read'):
        print(e.read().decode())
