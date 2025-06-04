import { Category } from '../types';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
}

export default function CategorySidebar({ categories, selectedCategory, onCategorySelect }: CategorySidebarProps) {
  return (
    <div className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Categories</h2>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-200 cursor-pointer ${
                selectedCategory === category.id
                  ? 'bg-blue-50 text-blue-800 font-medium'
                  : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <span className="text-lg mr-3">{category.icon}</span>
                <span>{category.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{category.courseCount}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 