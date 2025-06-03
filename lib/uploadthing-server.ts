import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function deleteFile(fileKey: string): Promise<boolean> {
  try {
    await utapi.deleteFiles(fileKey);
    return true;
  } catch (error) {
    console.error('Error deleting file from UploadThing:', error);
    return false;
  }
}

export async function deleteMultipleFiles(fileKeys: string[]): Promise<boolean> {
  try {
    await utapi.deleteFiles(fileKeys);
    return true;
  } catch (error) {
    console.error('Error deleting files from UploadThing:', error);
    return false;
  }
} 