import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy file để upload' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/png';
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // 1. Tùy chọn 1: Nếu có cấu hình ImgBB API Key trong ENV
    if (process.env.IMGBB_API_KEY) {
      try {
        const imgbbForm = new FormData();
        imgbbForm.append('image', base64Data);
        const imgbbRes = await fetch(
          `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
          {
            method: 'POST',
            body: imgbbForm,
          }
        );
        const imgbbJson = await imgbbRes.json();
        if (imgbbJson?.success && imgbbJson?.data?.url) {
          return NextResponse.json({
            success: true,
            message: 'Upload file lên ImgBB thành công',
            data: { url: imgbbJson.data.url },
          });
        }
      } catch (cloudErr) {
        console.warn('ImgBB upload failed, falling back...', cloudErr);
      }
    }

    // 2. Tùy chọn 2: Nếu có cấu hình Cloudinary trong ENV
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_UPLOAD_PRESET) {
      try {
        const cloudForm = new FormData();
        cloudForm.append('file', dataUrl);
        cloudForm.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);
        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: cloudForm,
          }
        );
        const cloudJson = await cloudRes.json();
        if (cloudJson?.secure_url) {
          return NextResponse.json({
            success: true,
            message: 'Upload file lên Cloudinary thành công',
            data: { url: cloudJson.secure_url },
          });
        }
      } catch (cloudErr) {
        console.warn('Cloudinary upload failed, falling back...', cloudErr);
      }
    }

    // 3. Tùy chọn 3: Lưu vào ổ đĩa cục bộ (Localhost hoặc VPS Server có quyền ghi)
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadDir, filename);

      await writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        message: 'Upload file thành công',
        data: {
          url: `/uploads/${filename}`,
        },
      });
    } catch (fsErr: any) {
      // 4. Tùy chọn 4 (Fallback Serverless / Vercel): Khi môi trường chỉ đọc (EROFS read-only filesystem)
      // Tự động chuyển đổi thành Base64 Data URL an toàn tuyệt đối
      console.log('Read-only filesystem detected (Serverless/Vercel). Using Base64 Data URL fallback.');

      return NextResponse.json({
        success: true,
        message: 'Upload file thành công (Base64 fallback)',
        data: {
          url: dataUrl,
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi upload file' },
      { status: 500 }
    );
  }
}