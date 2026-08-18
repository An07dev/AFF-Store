'use client';
import React from 'react';
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>ShopTik Admin</h2>
        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input type="email" className={styles.input} placeholder="admin@shoptik.com" />
          </div>
          <div className={styles.inputGroup}>
            <label>Mật khẩu</label>
            <input type="password" className={styles.input} placeholder="••••••••" />
          </div>
          <button type="button" className={styles.btn}>Đăng nhập</button>
        </form>
      </div>
    </div>
  );
}
