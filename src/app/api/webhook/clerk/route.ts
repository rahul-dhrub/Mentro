import { WebhookEvent } from '@clerk/nextjs/server';
import { Webhook } from 'svix';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    // Get the headers from the request
    const headersList = request.headers;
    const svix_id = headersList.get("svix-id") || '';
    const svix_timestamp = headersList.get("svix-timestamp") || '';
    const svix_signature = headersList.get("svix-signature") || '';

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occurred -- no svix headers', {
        status: 400
      });
    }

    // Get the body
    const payload = await request.clone().json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Please add WEBHOOK_SECRET to .env file');
    }
    
    const wh = new Webhook(webhookSecret);

    let evt: WebhookEvent;

    // Verify the webhook
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occurred during webhook verification', {
        status: 400
      });
    }

    // Connect to database
    try {
      await connectDB();
    } catch (error) {
      console.error('Database connection error:', error);
      return new Response('Database connection error', { status: 500 });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const userData = {
        clerkId: id,
        name: `${first_name || ''} ${last_name || ''}`.trim(),
        email: email_addresses[0]?.email_address || '',
        profilePicture: image_url || '',
      };

      try {
        // Update or create user
        await User.findOneAndUpdate(
          { clerkId: userData.clerkId },
          userData,
          { upsert: true, new: true }
        );

        return new Response('User data synchronized', { status: 200 });
      } catch (error) {
        console.error('Error saving user:', error);
        return new Response('Error saving user data', { status: 500 });
      }
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 