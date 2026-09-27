import { apiRequest } from '@/services/http';
import type { Category } from '@/types/marketplace';

interface CategoryNode {
  id: number;
  name: string;
  parent_id: number | null;
  children: CategoryNode[];
}

interface CategoriesResponse {
  status_code: number;
  data: CategoryNode[];
}

const styles: { icon: string; color: string }[] = [
  { icon: 'category', color: '#005bff' },
  { icon: 'checkroom', color: '#7c3aed' },
  { icon: 'kitchen', color: '#0d9488' },
  { icon: 'spa', color: '#db2777' },
  { icon: 'fitness_center', color: '#ea580c' },
  { icon: 'child_care', color: '#2563eb' },
  { icon: 'restaurant', color: '#16a34a' },
  { icon: 'menu_book', color: '#ca8a04' },
];

function mapNode(node: CategoryNode, index: number): Category {
  const style = styles[index % styles.length] ?? styles[0];

  return {
    id: String(node.id),
    title: node.name,
    parentId: node.parent_id == null ? null : String(node.parent_id),
    icon: style?.icon ?? 'category',
    color: style?.color ?? '#005bff',
    children: node.children.map(mapNode),
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await apiRequest<CategoriesResponse>('/v1/categories');

  return response.data.map(mapNode);
}
