import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
  const hasUriConfigured = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== '');

  let isConnected = false;
  let isSeeded = false;
  let errorMessage: string | null = null;
  let stats = {
    users: 0,
    products: 0,
    categories: 0,
  };

  try {
    const conn = await connectToDatabase();
    if (conn && mongoose.connection.readyState === 1) {
      isConnected = true;
      try {
        stats.users = await User.countDocuments();
        stats.products = await Product.countDocuments();
        stats.categories = await Category.countDocuments();
        isSeeded = stats.users > 0 && stats.categories > 0;
      } catch (err: any) {
        console.warn('Error reading stats:', err.message);
      }
    }
  } catch (error: any) {
    isConnected = false;
    errorMessage = error.message || 'Không thể kết nối tới cơ sở dữ liệu';
  }

  return NextResponse.json({
    success: true,
    data: {
      isVercel,
      hasUriConfigured,
      isConnected,
      isSeeded,
      stats,
      errorMessage,
      environment: isVercel ? 'vercel' : (process.env.NODE_ENV || 'development'),
    },
  });
}
