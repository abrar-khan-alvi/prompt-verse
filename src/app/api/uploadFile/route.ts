// src/app/api/uploadFile/route.ts
import { NextResponse, NextRequest } from 'next/server';
import FormDataNode from 'form-data'; // Use alias to avoid conflict if browser FormData is in scope
import axios from 'axios';
import fs from 'fs'; // Only needed if using formidable or temporarily saving file

export async function POST(request: NextRequest) {
  console.log('[API /api/uploadFile] Received POST request');

  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataApiSecret = process.env.PINATA_API_SECRET;

  if (!pinataApiKey || !pinataApiSecret) {
    console.error('[API /api/uploadFile] Pinata API keys not configured.');
    return NextResponse.json(
      { success: false, error: 'Pinata API keys not configured on server.' },
      { status: 500 }
    );
  }

  try {
    const requestFormData = await request.formData();
    const file = requestFormData.get('file') as File | null; // 'file' is the key used by frontend

    if (!file) {
      console.log('[API /api/uploadFile] No file found in FormData.');
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    console.log(
      '[API /api/uploadFile] File to upload:',
      file.name,
      'Type:',
      file.type,
      'Size:',
      file.size
    );

    const formData = new FormDataNode();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    formData.append('file', fileBuffer, {
      filename: file.name || 'untitled-file', // Use original filename or a default
      contentType: file.type || 'application/octet-stream', // Use provided type or a default
    });

    const pinataMetadata = JSON.stringify({
      name: file.name || `UploadedFile-${Date.now()}`, // Name of the pin on Pinata
      // You can add keyvalues here if needed:
      // keyvalues: { appName: 'AI-Prompt-NFTs', fileType: 'media' }
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1, // Use CIDv1 for better future-proofing
    });
    formData.append('pinataOptions', pinataOptions);

    console.log('[API /api/uploadFile] Sending file to Pinata...');
    const pinataResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(), // This sets the Content-Type with the correct boundary
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataApiSecret,
        },
      }
    );

    console.log('[API /api/uploadFile] Pinata response:', pinataResponse.data);
    if (pinataResponse.data && pinataResponse.data.IpfsHash) {
      return NextResponse.json({ success: true, cid: pinataResponse.data.IpfsHash });
    } else {
      throw new Error('Pinata response did not include IpfsHash.');
    }
  } catch (error: any) {
    console.error(
      '[API /api/uploadFile] Error during IPFS upload process:',
      error.response?.data || error.message,
      error.stack?.split('\n')[1]?.trim()
    );
    let errorMessage = 'Failed to upload file to IPFS via Pinata';
    if (axios.isAxiosError(error) && error.response?.data) {
      const pinataError = error.response.data.error;
      errorMessage = pinataError
        ? `Pinata Error: ${pinataError.reason || pinataError.details || JSON.stringify(pinataError)}`
        : JSON.stringify(error.response.data);
    } else if (error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
