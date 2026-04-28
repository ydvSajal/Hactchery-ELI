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

    const heatMapHtml = [
      { label: 'Sensemaking', score: scores.sensemaking },
      { label: 'Agency',      score: scores.agency },
      { label: 'Paradox',     score: scores.paradox },
      { label: 'System',      score: scores.system }
    ].map(row => {
      const level = row.score >= 22 ? 'high' : row.score >= 14 ? 'medium' : 'low';
      const cells = ['low', 'medium', 'high'].map(cellLvl => {
        const isActive = level === cellLvl;
        const color = cellLvl === 'high' ? '#2E7D55' : cellLvl === 'medium' ? '#A3840A' : '#C0392B';
        const bgColor = cellLvl === 'high' ? '#EAF5EE' : cellLvl === 'medium' ? '#FBF5E0' : '#FAE9E7';
        const emoji = cellLvl === 'high' ? '🟢' : cellLvl === 'medium' ? '🟨' : '🟥';
        
        return `
          <td style="width: 21%; text-align: center; background: ${isActive ? color : bgColor}; padding: 10px; border-radius: 4px; font-size: 16px; border: 1px solid ${isActive ? color : '#E8E4DE'};">
            ${isActive ? emoji : ''}
          </td>
        `;
      }).join('<td style="width: 2%"></td>');
      
      return `
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #1A1714; font-weight: 500;">${row.label}</td>
          ${cells}
        </tr>
        <tr><td colspan="6" style="height: 6px"></td></tr>
      `;
    }).join('');

    const mailOptions = {
      from: `"ELRI Assessment" <${process.env.SMTP_FROM}>`,
      to: `${email}, sidharth.tripathy@bennett.edu.in, tripathisanjeev323@gmail.com`,
      subject: `Your ELRI Results: ${archetype}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1A1714; border: 1px solid #E8E4DE; border-radius: 16px; overflow: hidden;">
          <div style="background: #C8622A; padding: 30px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 20px;">Here&rsquo;s your &lsquo;Entrepreneurial Leadership Readiness Assessment&rsquo;</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #1A1714;">Hi ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #7A7570; margin-bottom: 24px;">Thank you for completing the Entrepreneurial Leadership Readiness Assessment. Here is a summary of your results:</p>

            <div style="margin-bottom: 32px; border-bottom: 2px solid #F7F5F2; padding-bottom: 32px;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #C8622A; margin-bottom: 12px;">Diagnostic Framework</div>
              <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 16px 0; color: #1A1714;">Entrepreneurial Leadership Readiness Diagnostic (ELRD)</h3>
              <p style="font-size: 14px; color: #7A7570; line-height: 1.6; margin-bottom: 24px;">
                This diagnostic measures cognitive load capacity under uncertainty. It assesses: 
                How leaders sense reality, how they decide without closure, how they absorb risk, and how they shape systems.
              </p>
              
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #C8622A; margin-bottom: 12px;">Scoring Model: EL Readiness Index (ELRI)</div>
              <p style="font-size: 14px; color: #7A7570; margin-bottom: 16px;">Each pillar scored 0&ndash;28 and Total Score: 0&ndash;112</p>
              
              <div style="background: #FFFFFF; border: 1px solid #E8E4DE; border-radius: 8px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <thead>
                    <tr style="background: #F7F5F2;">
                      <th style="padding: 10px 14px; text-align: left; font-weight: 600; color: #7A7570; text-transform: uppercase; font-size: 10px; border-bottom: 1px solid #E8E4DE;">ELRI Score</th>
                      <th style="padding: 10px 14px; text-align: left; font-weight: 600; color: #7A7570; text-transform: uppercase; font-size: 10px; border-bottom: 1px solid #E8E4DE;">Leadership Reality</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style="padding: 10px 14px; border-bottom: 1px solid #E8E4DE; font-weight: 600; color: #C8622A;">0&ndash;39</td><td style="padding: 10px 14px; border-bottom: 1px solid #E8E4DE; color: #7A7570;">Legacy Leader (High Collapse Risk)</td></tr>
                    <tr><td style="padding: 10px 14px; border-bottom: 1px solid #E8E4DE; font-weight: 600; color: #C8622A;">40&ndash;69</td><td style="padding: 10px 14px; border-bottom: 1px solid #E8E4DE; color: #7A7570;">Transitional Leader</td></tr>
                    <tr><td style="padding: 10px 14px; border-bottom: 1px solid #E8E4DE; font-weight: 600; color: #C8622A;">70&ndash;89</td><td style="padding: 10px 14px; border-bottom: 1px solid #E8E4DE; color: #7A7570;">Entrepreneurial Leader</td></tr>
                    <tr><td style="padding: 10px 14px; font-weight: 600; color: #C8622A;">90&ndash;112</td><td style="padding: 10px 14px; color: #7A7570;">Founder of Futures</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            
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

            <div style="background: #F7F5F2; padding: 16px; border-radius: 8px; margin-top: 24px; margin-bottom: 24px;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #C8622A; margin-bottom: 12px;">Diagnostic Heat Map (Interpretive Layer)</div>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <thead>
                  <tr>
                    <th style="width: 30%"></th>
                    <th style="font-size: 9px; color: #7A7570; text-transform: uppercase; padding: 4px;">Low</th>
                    <th style="width: 2%"></th>
                    <th style="font-size: 9px; color: #7A7570; text-transform: uppercase; padding: 4px;">Med</th>
                    <th style="width: 2%"></th>
                    <th style="font-size: 9px; color: #7A7570; text-transform: uppercase; padding: 4px;">High</th>
                  </tr>
                </thead>
                <tbody>
                  ${heatMapHtml}
                </tbody>
              </table>

              <p style="font-size: 14px; color: #7A7570; margin: 0; line-height: 1.5;">
                <strong>Key Insight:</strong><br/>
                High EL readiness requires no red zones.<br/>
                One weak pillar creates systemic fragility.
              </p>
            </div>



            <h3 style="font-size: 16px; color: #1A1714; margin-bottom: 16px; border-bottom: 1px solid #E8E4DE; padding-bottom: 8px;">Leadership Failure Archetypes the Tool Reveals</h3>
            <ul style="font-size: 14px; color: #7A7570; padding-left: 20px; margin-bottom: 24px; line-height: 1.6;">
              <li><strong style="color:#C8622A">The Optimizer:</strong> High System / Low Agency</li>
              <li><strong style="color:#C8622A">The Visionary:</strong> High Sense / Low Execution</li>
              <li><strong style="color:#C8622A">The Hero:</strong> High Agency / Low Systems</li>
              <li><strong style="color:#C8622A">The Therapist:</strong> High Empathy / Low Paradox</li>
              <li><strong style="color:#C8622A">The Founder:</strong> High across all four</li>
            </ul>

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
