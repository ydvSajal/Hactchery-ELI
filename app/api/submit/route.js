import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, email, scores, category, insight, archetype, archetype_desc } = data;

    // 1. Save to Google Sheets via Apps Script
    try {
      console.log('Sending data to Apps Script:', process.env.GOOGLE_SCRIPT_URL);
      const sheetRes = await fetch(process.env.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resultText = await sheetRes.text();
      console.log('Apps Script Response:', sheetRes.status, resultText);
    } catch (sheetError) {
      console.error('Google Sheets error:', sheetError);
    }

    // 2. Send Email via SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"ELRI Assessment" <${process.env.SMTP_FROM}>`,
      to: `${email}, sidharth.tripathy@bennett.edu.in, tripathisanjeev323@gmail.com`,
      subject: `Your ELRI Results: ${archetype}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1A1714; border: 1px solid #E8E4DE; border-radius: 16px; overflow: hidden;">
          <div style="background: #C8622A; padding: 30px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">ELRI Assessment Complete</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #1A1714;">Hi ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #7A7570;">Thank you for completing the Entrepreneurial Leadership Readiness Assessment. Here is a summary of your results:</p>
            
            <div style="background: #F7F5F2; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
              <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #7A7570; margin-bottom: 8px;">Total Score</div>
              <div style="font-size: 48px; font-weight: bold; color: #C8622A;">${scores.total}<span style="font-size: 20px; color: #7A7570; font-weight: normal;">/112</span></div>
              <div style="font-size: 20px; font-weight: bold; color: #1A1714; margin-top: 12px;">${category}</div>
              <p style="font-size: 14px; color: #7A7570; margin-top: 8px;">${insight}</p>
            </div>

            <div style="background: #1A1714; color: #FFFFFF; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255,255,255,0.5); margin-bottom: 8px;">Your Leadership Archetype</div>
              <h3 style="margin: 0; font-size: 24px; color: #E8813A;">${archetype}</h3>
              <p style="font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.7); margin-top: 12px;">${archetype_desc}</p>
            </div>

            <h3 style="font-size: 16px; color: #1A1714; margin-bottom: 16px; border-bottom: 1px solid #E8E4DE; padding-bottom: 8px;">Pillar Breakdown:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #7A7570;">Sensemaking</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${scores.sensemaking}/28</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7A7570;">Agency & Ownership</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${scores.agency}/28</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7A7570;">Paradox Navigation</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${scores.paradox}/28</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7A7570;">System Creation</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${scores.system}/28</td>
              </tr>
            </table>

            <p style="margin-top: 40px; font-size: 12px; color: #7A7570; text-align: center; border-top: 1px solid #E8E4DE; padding-top: 20px;">
              This diagnostic is designed to help you identify your strengths and growth edges in entrepreneurial leadership.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
