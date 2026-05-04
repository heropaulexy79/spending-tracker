import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    // Gmail SMTP Configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_PASS, // Your App Password
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

    console.log("Attempting to send welcome email to:", email);
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully!");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("CRITICAL GMAIL ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

