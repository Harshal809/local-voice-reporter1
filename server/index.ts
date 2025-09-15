// server/index.ts
import express from "express";
import cors from "cors";
import { Resend } from "resend";

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY); // set in .env

app.post("/api/contact", async (req, res) => {
  try {
    const {
      name, email, phone, location, category, subject, message, imageUrl,
    } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    const to = process.env.CONTACT_TO;      // owner email, e.g. owner@civicpulse.in
    const from = process.env.CONTACT_FROM;  // e.g. "CivicPulse <no-reply@civicpulse.in>"
    if (!to || !from) {
      return res.status(500).json({ ok: false, error: "Email env not configured" });
    }

    const html = `
      <h2>New CivicPulse contact</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "-"}</p>
      <p><strong>Location:</strong> ${location || "-"}</p>
      <p><strong>Category:</strong> ${category || "-"}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br/>${String(message).replace(/\n/g, "<br/>")}</p>
      ${imageUrl ? `<p><strong>Image URL:</strong> <a href="${imageUrl}">${imageUrl}</a></p>` : ""}
    `;

    const result = await resend.emails.send({
      from,
      to: [to],
      reply_to: email,
      subject: `[CivicPulse] ${subject}`,
      html,
    });

    if ((result as any)?.error) {
      return res.status(500).json({ ok: false, error: (result as any).error.message });
    }
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "Unknown error" });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
