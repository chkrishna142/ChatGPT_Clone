import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

/**
 * Uploadcare Delete API Endpoint
 *
 * Required Environment Variables:
 * - UPLOADCARE_PUBLIC_KEY: Your Uploadcare public key
 * - UPLOADCARE_SECRET_KEY: Your Uploadcare secret key
 *
 * Usage: DELETE /api/uploadcare-delete
 * Body: { uuid: "file-uuid-here" }
 */

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { uuid } = await req.json();

    if (!uuid) {
      return new Response(JSON.stringify({ error: "UUID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Uploadcare delete API endpoint - delete from storage
    const uploadcareDeleteUrl = `https://api.uploadcare.com/files/${uuid}/storage/`;

    // Get Uploadcare API keys
    const uploadcarePublicKey = process.env.UPLOADCARE_PUBLIC_KEY;
    const uploadcareSecretKey = process.env.UPLOADCARE_SECRET_KEY;

    if (!uploadcarePublicKey || !uploadcareSecretKey) {
      return new Response(
        JSON.stringify({
          error:
            "Uploadcare configuration missing. Please set UPLOADCARE_PUBLIC_KEY and UPLOADCARE_SECRET_KEY",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Use Uploadcare.Simple authorization format
    const response = await fetch(uploadcareDeleteUrl, {
      method: "DELETE",
      headers: {
        Accept: "application/vnd.uploadcare-v0.7+json",
        Authorization: `Uploadcare.Simple ${uploadcarePublicKey}:${uploadcareSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "File deleted from Uploadcare",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      const errorText = await response.text();
      console.error("Uploadcare delete error:", errorText);

      return new Response(
        JSON.stringify({
          error: "Failed to delete file from Uploadcare",
          details: errorText || "Unknown error occurred",
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("Uploadcare delete error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to delete file from Uploadcare",
        details: error.message || "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
