import "../../tests/e2e/bootstrap";
import { authOptions } from "@/lib/authOptions";

async function run() {
  const credentialsProvider = authOptions.providers.find(
    (p: any) => p.id === "credentials" || p.name === "Credentials"
  ) as any;

  console.log("Testing options.authorize vs authorize:");
  try {
    const res = await credentialsProvider.options?.authorize(undefined);
    console.log("options.authorize(undefined) returned:", res);
  } catch (err: any) {
    console.log("options.authorize(undefined) threw:", err.message);
  }

  try {
    const res = await credentialsProvider.authorize(undefined);
    console.log("credentialsProvider.authorize(undefined) returned:", res);
  } catch (err: any) {
    console.log("credentialsProvider.authorize(undefined) threw:", err.message);
  }
}

run().catch(console.error);
