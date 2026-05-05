import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // 1. Extract the Token from the Authorization Header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // 2. Verify the Token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { email, name } = await request.json();

    // 3. Security Check: Ensure the email in the request matches the authenticated user
    if (decodedToken.email !== email) {
      console.warn(`SECURITY ALERT: User ${decodedToken.email} tried to send an email to ${email}`);
      return NextResponse.json({ error: 'Forbidden: Email mismatch' }, { status: 403 });
    }

    // Gmail SMTP Configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Crafting The Mind" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Welcome to your Behavioral Spending Journey',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Welcome, ${name}!</h2>
          <p>Thank you for joining <strong>Crafting the Mind</strong>. This is not just a spending tracker; it's your new system for behavioral awareness.</p>
          <p>Every time you spend, remember to pause for 10 seconds and reflect on the <em>why</em> behind your purchase.</p>
          <p>Let's build intentional financial habits together.</p>
          <br/>
          <p>Warmly,</p>
          <p><strong>The CTM Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("CRITICAL ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
