export async function GET() {
  return new Response(
    JSON.stringify({
      hasKey: !!process.env.CLERK_SECRET_KEY,
    })
  )
}
