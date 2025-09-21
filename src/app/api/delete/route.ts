import cloudinary from "@/config/cloudinary";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { publicId } = await req.json();

    if (!publicId) {
      return new Response(JSON.stringify({ error: "No public ID provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "File deleted successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: "Failed to delete file from Cloudinary",
          details: result.result,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("Delete error:", error);

    return new Response(
      JSON.stringify({
        error: "Delete failed",
        details: error.message || "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
