import { Resend } from "resend";

import { env } from "../config/env.js";

const resend = new Resend(env.resendApiKey);

type SendMagicLinkEmailInput = {
  email: string;
  name: string;
  token: string;
};

export const sendMagicLinkEmail = async ({
  email,
  name,
  token,
}: SendMagicLinkEmailInput) => {
  const magicLink = `${env.clientUrl}/auth/verify?token=${encodeURIComponent(token)}`;

  const { error } = await resend.emails.send({
    from: "MovieBox <onboarding@resend.dev>",
    to: email,
    subject: "Your secure MovieBox sign-in link",
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>MovieBox Sign In</title>
        </head>
        <body style="margin:0;padding:0;background:#080808;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#080808;padding:40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#111111;border:1px solid #242424;border-radius:14px;overflow:hidden;">
                  
                  <tr>
                    <td style="padding:30px 36px;border-bottom:1px solid #242424;">
                      <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                        <span style="color:#e50914;">MOVIE</span><span style="color:#ffffff;">BOX</span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:42px 36px 36px;">
                      <div style="display:inline-block;padding:7px 12px;background:#241014;border:1px solid #42151a;border-radius:999px;color:#ff5a62;font-size:12px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;">
                        Secure sign in
                      </div>

                      <h1 style="margin:22px 0 12px;font-size:30px;line-height:1.2;color:#ffffff;letter-spacing:-0.8px;">
                        Welcome back, ${name}
                      </h1>

                      <p style="margin:0;color:#a1a1aa;font-size:15px;line-height:1.7;">
                        Use the button below to securely continue to your MovieBox account.
                        You don't need a password.
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0;">
                        <tr>
                          <td align="center">
                            <a
                              href="${magicLink}"
                              style="display:inline-block;background:#e50914;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:8px;"
                            >
                              Continue to MovieBox
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div style="background:#181818;border:1px solid #292929;border-radius:10px;padding:16px 18px;">
                        <p style="margin:0;color:#d4d4d8;font-size:13px;line-height:1.6;">
                          This sign-in link expires in
                          <strong style="color:#ffffff;">10 minutes</strong>
                          and can only be used once.
                        </p>
                      </div>

                      <p style="margin:28px 0 0;color:#71717a;font-size:12px;line-height:1.7;">
                        If you didn't request this sign-in link, you can safely ignore this email.
                        Your account will not be affected.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:24px 36px;border-top:1px solid #242424;background:#0d0d0d;">
                      <p style="margin:0;color:#52525b;font-size:11px;line-height:1.6;text-align:center;">
                        © ${new Date().getFullYear()} MovieBox
                      </p>
                      <p style="margin:6px 0 0;color:#3f3f46;font-size:11px;text-align:center;">
                        Your movies. Your watchlist. Your MovieBox.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
};