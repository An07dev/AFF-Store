'use client';

import React, { useState, useRef } from 'react';
import { FiX, FiPlus, FiTrash2, FiUploadCloud, FiCheck, FiLayers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LazyImage from '@/components/common/LazyImage';
import { apiFetch } from '@/lib/api';
import styles from './ProductFormModal.module.css';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: any[];
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    salePrice: '',
    category: '',
    stock: 50,
    isFeatured: false,
    status: 'active' as 'active' | 'hidden',
    description: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [variants, setVariants] = useState<Array<{ color: string; size: string; stock: number; price: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Add Image via URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  // Upload image to /api/upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    setIsUploading(true);
    try {
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const resData = await res.json();
      if (resData.success && resData.data?.url) {
        setImages((prev) => [...prev, resData.data.url]);
        toast.success('Tải ảnh lên thành công!');
      } else {
        toast.error(resData.message || 'Lỗi tải ảnh lên');
      }
    } catch (err) {
      toast.error('Lỗi khi tải file ảnh');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove Image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Variant row
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        color: '',
        size: '',
        stock: Number(formData.stock) || 10,
        price: Number(formData.salePrice || formData.price) || 0,
      },
    ]);
  };

  // Update Variant field
  const handleUpdateVariant = (index: number, field: string, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  // Remove Variant row
  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Form using API 2.3 POST specs
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      toast.error('Vui lòng nhập giá niêm yết hợp lệ');
      return;
    }
    if (!formData.category) {
      toast.error('Vui lòng chọn danh mục cho sản phẩm');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
      category: formData.category,
      images: images.length > 0 ? images : ['/file.svg'],
      stock: Number(formData.stock) || 0,
      isFeatured: formData.isFeatured,
      status: formData.status,
      description: formData.description.trim(),
      variants: variants.filter((v) => v.color || v.size),
    };

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Thêm sản phẩm mới thành công!');
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Lỗi thêm sản phẩm');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            <FiLayers style={{ color: 'var(--primary, #3b82f6)' }} /> Thêm Sản Phẩm Mới
          </h2>
          <button className={styles.closeBtn} onClick={onClose} title="Đóng">
            <FiX />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className={styles.body}>
          {/* Row 1: Name & Category */}
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tên sản phẩm *</label>
              <input
                type="text"
                required
                className={styles.input}
                placeholder="VD: Áo Khoác Bomber Kaki 2 Lớp"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Danh mục sản phẩm *</label>
              <select
                required
                className={styles.select}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Price, Sale Price, Stock */}
          <div className={styles.grid3}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Giá niêm yết (VNĐ) *</label>
              <input
                type="number"
                required
                min="0"
                className={styles.input}
                placeholder="VD: 380000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Giá khuyến mãi (VNĐ)</label>
              <input
                type="number"
                min="0"
                className={styles.input}
                placeholder="VD: 299000"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Số lượng trong kho</label>
              <input
                type="number"
                min="0"
                className={styles.input}
                placeholder="VD: 50"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Row 3: Images Manager */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Hình ảnh sản phẩm</label>
            <div className={styles.imageSection}>
              {images.length > 0 && (
                <div className={styles.imageList}>
                  {images.map((img, idx) => (
                    <div key={idx} className={styles.imageItem}>
                      <LazyImage src={img} alt={`Ảnh ${idx + 1}`} style={{ width: '100%', height: '100%' }} />
                      <button
                        type="button"
                        className={styles.removeImgBtn}
                        onClick={() => handleRemoveImage(idx)}
                        title="Xóa ảnh này"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.imageInputs}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Nhập đường dẫn URL ảnh hoặc upload..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={handleAddImageUrl}
                  disabled={!newImageUrl.trim()}
                >
                  <FiPlus /> Thêm link
                </button>
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <FiUploadCloud /> {isUploading ? 'Đang tải...' : 'Upload ảnh'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </div>

          {/* Row 4: Variants Manager */}
          <div className={styles.variantSection}>
            <div className={styles.variantHeader}>
              <label className={styles.label} style={{ margin: 0 }}>
                Phân loại biến thể (Màu sắc / Kích thước)
              </label>
              <button type="button" className={styles.addVariantBtn} onClick={handleAddVariant}>
                <FiPlus /> Thêm biến thể
              </button>
            </div>

            {variants.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted, #94a3b8)' }}>
                Chưa có biến thể nào. Bấm "+ Thêm biến thể" nếu sản phẩm có nhiều màu hoặc size.
              </p>
            ) : (
              variants.map((v, idx) => (
                <div key={idx} className={styles.variantRow}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Màu sắc (VD: Đen, Trắng)"
                    value={v.color}
                    onChange={(e) => handleUpdateVariant(idx, 'color', e.target.value)}
                  />
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Kích thước (VD: M, L, XL)"
                    value={v.size}
                    onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    className={styles.input}
                    placeholder="Kho (VD: 25)"
                    value={v.stock}
                    onChange={(e) => handleUpdateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                  />
                  <input
                    type="number"
                    min="0"
                    className={styles.input}
                    placeholder="Giá biến thể"
                    value={v.price}
                    onChange={(e) => handleUpdateVariant(idx, 'price', parseInt(e.target.value) || 0)}
                  />
                  <button
                    type="button"
                    className={styles.deleteVariantBtn}
                    onClick={() => handleRemoveVariant(idx)}
                    title="Xóa biến thể này"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Row 5: Description */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Mô tả sản phẩm</label>
            <textarea
              className={styles.textarea}
              placeholder="VD: Chất liệu kaki cao cấp, chống gió thoáng khí, đường may tỉ mỉ..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Row 6: Toggles */}
          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              />
              Sản phẩm nổi bật (Hiển thị trang chủ)
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={formData.status === 'active'}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.checked ? 'active' : 'hidden' })
                }
              />
              Mở bán ngay lập tức (Active)
            </label>
          </div>

          {/* Footer Submit Buttons */}
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
              Hủy bỏ
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              <FiCheck /> {isSubmitting ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
