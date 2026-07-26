import axios from "axios";

const cloudName = import.meta.env.VITE_CLOUDINARY_NAME;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default");

  const response = await axios.post(CLOUDINARY_URL, formData);

  if (!response) {
    throw new Error("Falha ao fazer upload da imagem");
  }

  const url = response.data.secure_url;
  return url as string;
}
