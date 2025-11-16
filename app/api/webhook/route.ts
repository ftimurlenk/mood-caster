import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('[v0] Farcaster webhook received:', {
      type: body.type,
      data: body.data
    });

    // Handle different webhook events
    switch (body.type) {
      case 'frame_added':
        // Handle when user adds the frame
        console.log('[v0] Frame added by user:', body.data.fid);
        break;
      
      case 'frame_removed':
        // Handle when user removes the frame
        console.log('[v0] Frame removed by user:', body.data.fid);
        break;
      
      case 'notifications_enabled':
        // Handle notification subscription
        console.log('[v0] Notifications enabled:', body.data.fid);
        break;
      
      case 'notifications_disabled':
        // Handle notification unsubscription
        console.log('[v0] Notifications disabled:', body.data.fid);
        break;
      
      default:
        console.log('[v0] Unknown webhook type:', body.type);
    }

    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('[v0] Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle GET requests (for webhook verification)
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: 'MoodCaster webhook endpoint active',
    app: 'MoodCaster for Base Network'
  });
}
