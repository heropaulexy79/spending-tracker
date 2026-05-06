import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

const welcomeSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
});

export async function POST(request: Request) {
  try {
    // 1. Extract the Token from the Authorization Header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // 2. Validate Input with Zod
    const body = await request.json();
    const result = welcomeSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input data', details: result.error.format() }, { status: 400 });
    }

    const { email, name } = result.data;

    // 2.5 Sanitize name to prevent HTML injection in email
    const sanitizedName = name
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // 3. Verify the Token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // 4. Security Check: Ensure the email in the request matches the authenticated user
    if (decodedToken.email !== email) {
      console.warn(`SECURITY ALERT: User ${decodedToken.email} tried to send an email to ${email}`);
      return NextResponse.json({ error: 'Forbidden: Email mismatch' }, { status: 403 });
    }

    // 5. Rate Limiting Check (Database-backed)
    // Only send the welcome email once per user lifetime
    const userRef = adminDb.collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists && userDoc.data()?.sentWelcome) {
      return NextResponse.json({ success: true, message: 'Welcome email already sent' });
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
      from: `"S&B Tracker" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Welcome to your Behavioral Spending Journey',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Welcome, ${sanitizedName}!</h2>
          <p>Thank you for joining <strong>S&B Tracker</strong>. This is not just a spending tracker; it's your new system for behavioral awareness.</p>
          <p>Every time you spend, remember to pause for 10 seconds and reflect on the <em>why</em> behind your purchase.</p>
          <p>Let's build intentional financial habits together.</p>
          <br/>
          <p>Warmly,</p>
          <p><strong>The S&B Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // 6. Mark as sent in Database
    await userRef.set({ sentWelcome: true }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("CRITICAL ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
