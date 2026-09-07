const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-review-template`;
for (let attempt = 0; attempt < 60; attempt++) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    // Auth is checked by the application function: 401 proves it is serving.
    if (response.status === 401) process.exit(0);
  } catch { /* Runtime is still starting. */ }
  await new Promise(resolve => setTimeout(resolve, 1000));
}
throw new Error('Local Edge Functions did not become ready');
