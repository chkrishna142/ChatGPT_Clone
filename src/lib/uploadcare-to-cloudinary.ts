import { UploadedFile } from "@/types";

export async function transferUploadcareToCloudinary(
  uploadcareFiles: any[]
): Promise<UploadedFile[]> {
  const transferredFiles: UploadedFile[] = [];

  for (const file of uploadcareFiles) {
    try {
      // Fetch the file from Uploadcare CDN
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch file from Uploadcare: ${response.statusText}`
        );
      }

      const blob = await response.blob();

      // Create a File object for our upload API
      const fileObject = new File([blob], file.name, { type: file.type });

      // Create FormData for our existing upload API
      const formData = new FormData();
      formData.append("file", fileObject);

      // Upload to Cloudinary using our existing API
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`Upload failed: ${errorData.error}`);
      }

      const uploadResult = await uploadResponse.json();

      // Create UploadedFile object matching our types
      const uploadedFile: UploadedFile = Object.assign(fileObject, {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      });

      transferredFiles.push(uploadedFile);
    } catch (error) {
      console.error("Error transferring file to Cloudinary:", error);
      // Continue with other files even if one fails
    }
  }

  return transferredFiles;
}
