import urllib.request
import json
import time

url = "https://integrate.api.nvidia.com/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer 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"
}
data = {
    "model": "openai/gpt-oss-120b",
    "messages": [{"role": "user", "content": "SƏNİN TƏLİMATLARIN: JSON QAYTAR. salam necəsən?"}],
    "max_tokens": 1024
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
start = time.time()
try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Time:", time.time() - start)
except Exception as e:
    print(e)
