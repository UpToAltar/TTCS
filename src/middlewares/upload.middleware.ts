import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

// Định nghĩa kiểu dữ liệu cho storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(png|jpe?g|webp)$/)) {
      return cb(new Error('Only .png, .jpg, .jpeg, .webp formats are allowed!'))
    }
    cb(null, true)
  }
})

export default upload
