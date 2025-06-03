import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  email: string;
  mobile: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { email, mobile, message } = body;

    // Validate required fields
    if (!email || !mobile || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Mobile validation
    const mobileRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    if (!mobileRegex.test(mobile)) {
      return NextResponse.json(
        { error: 'Invalid mobile number' },
        { status: 400 }
      );
    }

    // Message length validation
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Here you can add your email sending logic
    // For example, using services like SendGrid, Nodemailer, or AWS SES
    console.log('Contact form submission:', {
      email,
      mobile,
      message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement email sending logic
    // Example with nodemailer or your preferred email service:
    /*
    await sendEmail({
      to: 'admin@yourcompany.com',
      subject: 'New Contact Form Submission',
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mobile:</strong> ${mobile}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
    });
    */

    // Save to database (optional)
    // You can also save the contact form submissions to your database
    /*
    await prisma.contactSubmission.create({
      data: {
        email,
        mobile,
        message,
        createdAt: new Date(),
      },
    });
    */

    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact form submitted successfully' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS (if needed)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
