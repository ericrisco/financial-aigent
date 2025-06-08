import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import confetti from 'canvas-confetti';
import { Loader2, Square, Copy, CheckCircle } from 'lucide-react';

interface ProcessingStatusProps {
  isProcessing: boolean;
  status: string;
  result: string;
  progress: number;
  onStop: () => void;
}

const MarkdownComponents: Partial<Components> = {
  h1: ({...props}) => <h1 className="text-4xl font-bold mb-8 text-white border-b-2 border-blue-500/30 pb-4 text-left" {...props} />,
  h2: ({...props}) => <h2 className="text-3xl font-bold mb-6 text-white mt-12 text-left border-l-4 border-blue-500 pl-4" {...props} />,
  h3: ({...props}) => <h3 className="text-2xl font-semibold mb-4 text-white mt-8 text-left" {...props} />,
  h4: ({...props}) => <h4 className="text-xl font-semibold mb-3 text-slate-100 mt-6 text-left" {...props} />,
  h5: ({...props}) => <h5 className="text-lg font-semibold mb-2 text-slate-100 mt-4 text-left" {...props} />,
  p: ({...props}) => <p className="mb-6 text-slate-200 leading-relaxed text-left text-base" {...props} />,
  ul: ({...props}) => <ul className="list-disc ml-6 mb-6 space-y-2" {...props} />,
  ol: ({...props}) => <ol className="list-decimal ml-6 mb-6 space-y-2" {...props} />,
  li: ({...props}) => <li className="text-slate-200 leading-relaxed text-left mb-1" {...props} />,
  a: ({href, ...props}) => (
    <a 
      className="text-blue-400 hover:text-blue-300 hover:underline transition-colors" 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  code: ({className, children, ...props}) => {
    if (className?.includes('language-')) {
      return (
        <div className="relative group mb-4">
          <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => navigator.clipboard.writeText(String(children))}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          </div>
          <code className="block bg-slate-900/50 rounded-xl p-4 overflow-x-auto text-slate-200 border border-slate-700/50" {...props}>
            {children}
          </code>
        </div>
      );
    }
    return <code className="bg-slate-800/50 rounded px-2 py-1 text-blue-400 border border-slate-700/50" {...props}>{children}</code>;
  },
  blockquote: ({...props}) => (
    <blockquote 
      className="border-l-4 border-blue-500 pl-6 italic mb-6 text-slate-300 bg-slate-800/30 p-6 rounded-r-xl border border-slate-700/50 text-left"
      {...props}
    />
  ),
  hr: ({...props}) => <hr className="border-slate-600/50 my-12" {...props} />,
  table: ({...props}) => (
    <div className="overflow-x-auto mb-8 rounded-lg border border-slate-700/50">
      <table className="min-w-full" {...props} />
    </div>
  ),
  th: ({...props}) => <th className="bg-slate-800/70 text-white font-semibold p-4 text-left border-b border-slate-700/50" {...props} />,
  td: ({...props}) => <td className="text-slate-200 p-4 border-b border-slate-700/30 text-left" {...props} />,
};

export const ProcessingStatus = ({ isProcessing, status, result, progress, onStop }: ProcessingStatusProps) => {
  useEffect(() => {
    if (!isProcessing && result) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;
      const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

      const frame = () => {
        const searchInput = document.querySelector('input[type="text"]');
        if (!searchInput) return;

        const rect = searchInput.getBoundingClientRect();
        const inputCenterX = (rect.left + rect.right) / 2 / window.innerWidth;
        const inputCenterY = rect.bottom / window.innerHeight;

        confetti({
          particleCount: 12,
          spread: 360,
          startVelocity: 30,
          origin: { x: inputCenterX, y: inputCenterY },
          colors: colors,
          ticks: 200
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isProcessing, result]);

  if (!isProcessing && !status && !result) return null;

  return (
    <div className="mt-8">
      {isProcessing && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              <p className="text-slate-200 font-medium">{status}</p>
            </div>
            <button
              onClick={onStop}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Stop Analysis</span>
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-400">
                Progress: {Math.round(progress)}%
              </span>
              <span className="text-xs text-slate-400">
                {progress < 25 ? 'Planning research strategy...' :
                 progress < 50 ? 'Gathering data from sources...' :
                 progress < 75 ? 'Analyzing and summarizing...' :
                 progress < 95 ? 'Generating report structure...' :
                 'Finalizing analysis...'}
              </span>
            </div>
            <div className="relative">
              <div className="overflow-hidden h-2 rounded-full bg-slate-700/50">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!isProcessing && result && (
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center space-x-2 px-6 py-4 bg-slate-800/50 border-b border-slate-700/30">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Análisis Financiero Completo</h3>
          </div>
          
          <div className="p-8 max-w-none text-left">
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={MarkdownComponents}
              >
                {result}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 