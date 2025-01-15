import { FaSearch, FaTimes, FaRandom } from 'react-icons/fa';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onRandomSelect: () => void;
  isLightTheme: boolean;
  placeholder?: string;
}

export const SearchInput = ({
  value,
  onChange,
  onClear,
  onRandomSelect,
  isLightTheme,
  placeholder = 'Search participants...',
}: SearchInputProps) => {
  return (
    <div className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded border py-2 pl-10 pr-16 focus:outline-none ${
          isLightTheme ? 'border-gray-300 bg-white text-black' : 'border-gray-600 bg-gray-700 text-white'
        }`}
      />
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" size={16} />
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 transform items-center space-x-2">
        {value && (
          <button
            onClick={onClear}
            className={`mr-1 transition-opacity hover:opacity-75 ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
            <FaTimes size={16} />
          </button>
        )}
        <button
          title="Select random participant"
          onClick={onRandomSelect}
          className={`transition-opacity hover:opacity-75 ${isLightTheme ? 'text-gray-600' : 'text-gray-400'}`}>
          <FaRandom size={16} />
        </button>
      </div>
    </div>
  );
};
