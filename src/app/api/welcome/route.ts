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
    const userRef = adminDb.collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    
    // Only send the welcome email once per user lifetime
    if (userData?.sentWelcome === true) {
      console.log(`Email already sent for user ${email}. Skipping.`);
      return NextResponse.json({ success: true, message: 'Welcome email already sent' });
    }

    // Secondary Rate Limit: Check if an email was attempted in the last 24h (anti-spam)
    const lastAttempt = userData?.lastWelcomeAttempt?.toDate();
    if (lastAttempt && (Date.now() - lastAttempt.getTime() < 24 * 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again tomorrow.' }, { status: 429 });
    }

    // Update attempt timestamp before sending (Fail-closed approach)
    await userRef.set({ lastWelcomeAttempt: new Date() }, { merge: true });

    // Gmail SMTP Configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Crafting the Mind" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Crafting the Mind – Your Behavioral Tracking Journey',
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: auto; padding: 40px; background-color: #0A0A0B; color: #ffffff; border-radius: 20px;">
          <h1 style="font-family: 'Playfair Display', serif; color: #B08447; font-size: 28px;">Welcome, ${sanitizedName}.</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #e5e5e5;">Thank you for joining <strong>Crafting the Mind</strong>. This is more than a tracker; it's a guided system for behavioral awareness and intentional living.</p>
          <p style="font-size: 16px; line-height: 1.6; color: #e5e5e5;">Every entry you make is a step toward mastering your intentions. Remember: the 10-second pause is where the change happens.</p>
          <p style="font-size: 16px; line-height: 1.6; color: #e5e5e5;">We're honored to be part of your journey.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333;">
            <p style="font-size: 14px; color: #888;">Warmly,</p>
            <p style="font-size: 14px; color: #B08447; font-weight: bold;">The Crafting the Mind Team</p>
          </div>
        </div>
      `,
    };

    const adminMailOptions = {
      from: `"S&B System" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
      subject: 'New User Onboarding: Crafting the Mind',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New User Joined</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    };

    await Promise.all([
      transporter.sendMail(mailOptions),
      transporter.sendMail(adminMailOptions)
    ]);

    // 6. Mark as sent in Database
    await userRef.set({ 
      sentWelcome: true,
      email,
      name: sanitizedName,
      signupDate: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("CRITICAL ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
