// src/app/api/uploadMetadata/route.ts
import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  console.log('[API /api/uploadMetadata] Received POST request');

  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataApiSecret = process.env.PINATA_API_SECRET;

  if (!pinataApiKey || !pinataApiSecret) {
    console.error('[API /api/uploadMetadata] Pinata API keys not configured.');
    return NextResponse.json({ success: false, error: 'Pinata API keys not configured on server.' }, { status: 500 });
  }

  try {
    const metadataToPin = await request.json(); // The metadata object sent from the frontend

    if (!metadataToPin || typeof metadataToPin !== 'object' || !metadataToPin.name || !metadataToPin.prompt_text) {
        console.error('[API /api/uploadMetadata] Invalid or incomplete metadata received.');
        return NextResponse.json({ success: false, error: 'Invalid or incomplete metadata. Must include name and prompt_text.'}, { status: 400 });
    }

    // Structure for Pinata's pinJSONToIPFS
    const pinataData = {
        pinataOptions: {
            cidVersion: 1,
        },
        pinataMetadata: {
            name: metadataToPin.name || `AI-Prompt-Metadata-${Date.now()}`, // Name for the pin on Pinata
            keyvalues: {
                platform: metadataToPin.platform || 'Unknown',
                // Add any other keyvalues you want to filter by on Pinata
            }
        },
        pinataContent: metadataToPin // The entire metadata object from your form
    };

    console.log('[API /api/uploadMetadata] Sending JSON to Pinata. Metadata Name:', pinataData.pinataMetadata.name);
    const pinataResponse = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      pinataData,
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataApiSecret,
        },
      }
    );

    console.log('[API /api/uploadMetadata] Pinata response:', pinataResponse.data);
     if (pinataResponse.data && pinataResponse.data.IpfsHash) {
        return NextResponse.json({ success: true, cid: pinataResponse.data.IpfsHash });
    } else {
        throw new Error("Pinata response did not include IpfsHash for JSON metadata.");
    }

  } catch (error: any) {
    console.error('[API /api/uploadMetadata] Error during IPFS JSON upload:', error.response?.data || error.message, error.stack?.split('\n')[1]?.trim());
    let errorMessage = 'Failed to upload metadata JSON to IPFS via Pinata';
     if (axios.isAxiosError(error) && error.response?.data) {
        const pinataError = error.response.data.error;
        errorMessage = pinataError ? `Pinata Error: ${pinataError.reason || pinataError.details || JSON.stringify(pinataError)}` : JSON.stringify(error.response.data);
    } else if (error.message) {
        errorMessage = error.message;
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}