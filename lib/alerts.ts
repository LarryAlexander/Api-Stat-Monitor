import { adminAuth } from "@/lib/firebase/admin";
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";

  if (host && port) {
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
    return transporter;
  }
  return null;
}

async function getWorkspaceEmail(workspaceId: string): Promise<string | null> {
  try {
    const user = await adminAuth.getUser(workspaceId);
    return user.email ?? null;
  } catch (err) {
    console.error(`Failed to get email for user ${workspaceId}:`, err);
    return null;
  }
}

export async function sendOutageAlert(
  workspaceId: string,
  monitorName: string,
  url: string,
  error: string | null
) {
  const email = await getWorkspaceEmail(workspaceId);
  if (!email) {
    console.log(`[ALERT FALLBACK] Monitor "${monitorName}" is DOWN. Url: ${url}. Error: ${error}. No email found.`);
    return;
  }

  // 1. Try SMTP if configured
  const smtpTransporter = getTransporter();
  const smtpFromEmail = process.env.SMTP_FROM_EMAIL || "PulseBoard <alerts@yourdomain.com>";

  if (smtpTransporter) {
    try {
      await smtpTransporter.sendMail({
        from: smtpFromEmail,
        to: email,
        subject: `🚨 Outage Alert: ${monitorName} is DOWN`,
        html: `
          <h3>Outage Detected</h3>
          <p>Your monitor <strong>${monitorName}</strong> (${url}) is down.</p>
          <p><strong>Error:</strong> ${error ?? "No status code / timeout"}</p>
          <p>Time: ${new Date().toUTCString()}</p>
        `,
      });
      console.log(`Outage email sent via SMTP to ${email} for monitor ${monitorName}`);
      return;
    } catch (err) {
      console.error("Failed to send outage alert email via SMTP, attempting Resend fallback:", err);
    }
  }

  // 2. Try Resend if configured
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.ALERT_FROM_EMAIL || "PulseBoard <alerts@yourdomain.com>";

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: resendFromEmail,
          to: [email],
          subject: `🚨 Outage Alert: ${monitorName} is DOWN`,
          html: `
            <h3>Outage Detected</h3>
            <p>Your monitor <strong>${monitorName}</strong> (${url}) is down.</p>
            <p><strong>Error:</strong> ${error ?? "No status code / timeout"}</p>
            <p>Time: ${new Date().toUTCString()}</p>
          `,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Resend API failed: ${errBody}`);
      }
      console.log(`Outage email sent via Resend to ${email} for monitor ${monitorName}`);
      return;
    } catch (err) {
      console.error("Failed to send outage alert email via Resend:", err);
    }
  }

  // 3. Fallback to console logs
  console.log(`[ALERT MOCK] To: ${email} | Subject: 🚨 Outage Alert: ${monitorName} is DOWN | Body: ${url} failed with error: ${error}`);
}

export async function sendRecoveryAlert(
  workspaceId: string,
  monitorName: string,
  url: string
) {
  const email = await getWorkspaceEmail(workspaceId);
  if (!email) {
    console.log(`[ALERT FALLBACK] Monitor "${monitorName}" has RECOVERED. Url: ${url}. No email found.`);
    return;
  }

  // 1. Try SMTP if configured
  const smtpTransporter = getTransporter();
  const smtpFromEmail = process.env.SMTP_FROM_EMAIL || "PulseBoard <alerts@yourdomain.com>";

  if (smtpTransporter) {
    try {
      await smtpTransporter.sendMail({
        from: smtpFromEmail,
        to: email,
        subject: `✅ Recovery Alert: ${monitorName} is BACK`,
        html: `
          <h3>Service Recovered</h3>
          <p>Your monitor <strong>${monitorName}</strong> (${url}) has recovered and is now healthy.</p>
          <p>Time: ${new Date().toUTCString()}</p>
        `,
      });
      console.log(`Recovery email sent via SMTP to ${email} for monitor ${monitorName}`);
      return;
    } catch (err) {
      console.error("Failed to send recovery alert email via SMTP, attempting Resend fallback:", err);
    }
  }

  // 2. Try Resend if configured
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.ALERT_FROM_EMAIL || "PulseBoard <alerts@yourdomain.com>";

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: resendFromEmail,
          to: [email],
          subject: `✅ Recovery Alert: ${monitorName} is BACK`,
          html: `
            <h3>Service Recovered</h3>
            <p>Your monitor <strong>${monitorName}</strong> (${url}) has recovered and is now healthy.</p>
            <p>Time: ${new Date().toUTCString()}</p>
          `,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Resend API failed: ${errBody}`);
      }
      console.log(`Recovery email sent via Resend to ${email} for monitor ${monitorName}`);
      return;
    } catch (err) {
      console.error("Failed to send recovery alert email via Resend:", err);
    }
  }

  // 3. Fallback to console logs
  console.log(`[ALERT MOCK] To: ${email} | Subject: ✅ Recovery Alert: ${monitorName} is BACK | Body: ${url} has recovered`);
}
