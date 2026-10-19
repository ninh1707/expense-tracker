import React from 'react';
import {
  Utensils,
  ShoppingBag,
  CarFront,
  Receipt,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  House,
  BriefcaseBusiness,
  Laptop,
  TrendingUp,
  PiggyBank,
  Ellipsis,
  Tag,
  type LucideIcon
} from 'lucide-react';
import { getCategoryById } from '../../utils/categories';

// Một bộ ánh xạ duy nhất: cùng mã danh mục dùng chung icon và màu ở mọi trang.
// Ánh xạ từ tên icon đã lưu trong CATEGORIES, không dựa trên tên tiếng Việt.
const iconByName: Record<string, LucideIcon> = {
  Utensils,
  ShoppingBag,
  Car: CarFront,
  FileText: Receipt,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Home: House,
  Briefcase: BriefcaseBusiness,
  Laptop,
  TrendingUp,
  PiggyBank,
  MoreHorizontal: Ellipsis,
  Tag
};

interface CategoryIconProps {
  categoryId: string;
  /** tile: biểu tượng trong khung màu; inline: chỉ icon đặt cạnh tên danh mục */
  variant?: 'tile' | 'inline';
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  categoryId, variant = 'tile', size = 20, className = ''
}) => {
  const category = getCategoryById(categoryId);
  const Icon = iconByName[category.icon] ?? Tag;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${variant === 'tile' ? 'h-10 w-10 rounded-xl' : ''} ${className}`}
      style={{
        color: category.color,
        ...(variant === 'tile' ? { backgroundColor: category.bgColor } : {})
      }}
    >
      <Icon size={size} strokeWidth={2} />
    </span>
  );
};
