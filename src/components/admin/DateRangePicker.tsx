'use client';

import React from 'react';
import styles from './DateRangePicker.module.css';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  return (
    <div className={styles.container}>
      <input
        type="date"
        className={styles.dateInput}
        value={startDate}
        onChange={(e) => onChange(e.target.value, endDate)}
      />
      <span className={styles.separator}>đến</span>
      <input
        type="date"
        className={styles.dateInput}
        value={endDate}
        onChange={(e) => onChange(startDate, e.target.value)}
      />
    </div>
  );
}