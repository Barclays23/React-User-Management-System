import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Convert buffer to readable stream
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => {}; // _read is required but you can noop it
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// export const uploadToCloudinary = async (filePath, projectName, collection) => {
//   const folderPath = `${projectName}/${collection}`;
//   const result = await cloudinary.uploader.upload(filePath, {
//     folder: folderPath,
//   });
//   return result.secure_url;
// };

// Upload image using stream and Promise
export const uploadBufferToCloudinary = (buffer, folderPath) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderPath, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    bufferToStream(buffer).pipe(stream);
  });
};


export default cloudinary;