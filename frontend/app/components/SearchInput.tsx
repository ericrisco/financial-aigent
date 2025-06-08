import { ChangeEvent } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  isProcessing: boolean;
}

export const SearchInput = ({ value, onChange, onSearch, isProcessing }: SearchInputProps) => {
  return (
    <div className="relative">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={value}
            onChange={onChange}
            disabled={isProcessing}
            placeholder="Enter your financial research query... (e.g., 'Apple stock analysis', 'Tesla earnings report', 'Bitcoin market trends')"
            className="w-full pl-12 pr-6 py-4 text-lg rounded-xl border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:bg-slate-800/30 disabled:cursor-not-allowed placeholder-slate-400"
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
        <button
          onClick={onSearch}
          disabled={isProcessing || !value.trim()}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>{isProcessing ? 'Analyzing...' : 'Analyze'}</span>
        </button>
      </div>
      
      {/* Example queries */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-slate-400">Try:</span>
        {['Apple stock analysis', 'Tesla earnings report', 'Bitcoin market trends', 'Microsoft financial performance'].map((example, index) => (
          <button
            key={index}
            onClick={() => onChange({ target: { value: example } } as ChangeEvent<HTMLInputElement>)}
            disabled={isProcessing}
            className="text-sm px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full hover:bg-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}; 