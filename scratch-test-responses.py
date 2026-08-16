import urllib.request
import json

url = "https://integrate.api.nvidia.com/v1/responses"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer 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"
}
data = {
    "model": "openai/gpt-oss-120b",
    "input": "Salam",
    "max_output_tokens": 1024
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print(response.read().decode())
except Exception as e:
    print(e)
    if hasattr(e, 'read'):
        print(e.read().decode())
