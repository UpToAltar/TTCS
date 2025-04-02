import { v2 as cloudinary } from 'cloudinary'
import { UploadApiResponse } from 'cloudinary'

// ✅ Hàm upload file với buffer, lưu vào thư mục "TTCS"
const uploadToCloudinary = async (fileBuffer: Buffer): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'TTCS', // 🟢 Lưu vào thư mục "TTCS"
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          reject(new Error('Upload thất bại: ' + error.message))
        } else {
          resolve(result as UploadApiResponse)
        }
      }
    )

    uploadStream.end(fileBuffer) // Gửi buffer vào Cloudinary
  })
}

export default uploadToCloudinary
