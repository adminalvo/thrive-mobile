import urllib.request
import json

url = "https://integrate.api.nvidia.com/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer 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"
}
data = {
    "model": "openai/gpt-oss-120b",
    "messages": [{"role": "user", "content": "Salam! Özünü qısaca təqdim et."}],
    "temperature": 1,
    "max_tokens": 150
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        print(result['choices'][0]['message']['content'])
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode())
