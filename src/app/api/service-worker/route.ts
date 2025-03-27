import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the service worker file in the public directory
    const serviceWorkerPath = path.join(process.cwd(), 'public', 'service-worker.js');
    
    // Read the file content
    const fileContent = fs.readFileSync(serviceWorkerPath, 'utf-8');
    
    // Create a response with the service worker content
    const response = new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
        'Service-Worker-Allowed': '/'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error serving service worker:', error);
    return new NextResponse('Service worker not found', { status: 404 });
  }
} 