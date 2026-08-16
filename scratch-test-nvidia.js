const apiKey = "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";

async function testNvidiaAPI() {
  console.log("Nvidia API-nə sorğu göndərilir...");
  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-405b-instruct", // Testing with standard Llama 3 model on Nvidia NIM
        messages: [{ role: "user", content: "Salam! Özünü qısaca təqdim et." }],
        temperature: 0.5,
        max_tokens: 150
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log("\n✅ UĞURLU! Nvidia API-dən gələn cavab:");
      console.log("-------------------------------------------------");
      console.log(data.choices[0].message.content);
      console.log("-------------------------------------------------");
    } else {
      const errorText = await response.text();
      console.error("\n❌ XƏTA! API xəta qaytardı:");
      console.error(errorText);
    }
  } catch (error) {
    console.error("Şəbəkə xətası:", error);
  }
}

testNvidiaAPI();
