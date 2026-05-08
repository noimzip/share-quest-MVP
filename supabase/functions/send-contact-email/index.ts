import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { name, email, subject, body } = await req.json();

  await Promise.all([
    // 運営へ通知
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "SHARE Quest <onboarding@resend.dev>",
        to: "share.quest.official@gmail.com",
        reply_to: email,
        subject: `【お問い合わせ】${subject}`,
        text: `名前: ${name}\nメール: ${email}\n\n${body}`,
      }),
    }),

    // 送信者へ自動返信
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "SHARE Quest <onboarding@resend.dev>",
        to: email,
        subject: `【受付完了】${subject}`,
        text: `${name} 様\n\nお問い合わせありがとうございます。\n以下の内容で受け付けました。\n\n件名: ${subject}\n\n${body}\n\n内容を確認の上、順次ご返信いたします。\n\n─────────────────\nSHARE Quest 運営チーム\nhttps://share-quest.vercel.app\n─────────────────`,
      }),
    }),
  ]);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
