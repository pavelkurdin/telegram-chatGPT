import { unlink } from "fs/promises";
export async function deleteFile(filePath) {
  try {
    await unlink(filePath);
  } catch (e) {
    console.log("Error while deleting file ", e.message);
  }
}
