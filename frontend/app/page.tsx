'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import { SearchInput } from './components/SearchInput';
import { ProcessingStatus } from './components/ProcessingStatus';
import { WebSocketService } from './services/websocket.service';
import { Brain, TrendingUp, FileText, Search, Zap, BarChart3, Globe, Newspaper } from 'lucide-react';

const STEP_PROGRESS = {
  'search_planner': 10,
  'search': 25,
  'summarize': 40,
  'analyze_gaps': 60,
  'generate_structure': 75,
  'generate_content': 90,
  'complete': 100,
  'error': 0
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState('');
  const [progress, setProgress] = useState(0);
  const [wsService] = useState(() => new WebSocketService());

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await wsService.connect();
        wsService.onMessage((message) => {
          setStatus(message.details);
          setProgress(STEP_PROGRESS[message.step] || 0);

          if (message.step === 'complete') {
            setResult(message.completion || '');
            setIsProcessing(false);
          } else if (message.step === 'error') {
            setResult(`Error: ${message.details}`);
            setIsProcessing(false);
          }
        });
      } catch (error) {
        setStatus('Connection error with research service');
        console.error('WebSocket connection error:', error);
      }
    };

    connectWebSocket();

    return () => {
      wsService.disconnect();
    };
  }, [wsService]);

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    if (!query.trim() || isProcessing) return;
    
    try {
      setIsProcessing(true);
      setStatus('Starting intelligent research analysis...');
      setResult('');
      setProgress(0);
      wsService.startResearch(query);
    } catch (error) {
      setStatus('Error starting research');
      setIsProcessing(false);
      console.error('Error starting research:', error);
    }
  };

  const handleStop = () => {
    wsService.disconnect();
    setIsProcessing(false);
    setStatus('Analysis stopped by user');
    setProgress(0);
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Research Planning",
      description: "Intelligent query analysis and multi-source research strategy planning"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Multi-Source Search",
      description: "Tavily web search, Yahoo Finance data, and NewsData integration"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Financial Analysis",
      description: "Real-time stock data, market metrics, and financial performance analysis"
    },
    {
      icon: <Newspaper className="w-6 h-6" />,
      title: "News Intelligence",
      description: "Latest news analysis, market sentiment, and breaking developments"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Document Generation",
      description: "Professional investment reports with structured analysis and recommendations"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Gap Analysis",
      description: "Intelligent knowledge gap detection and iterative research refinement"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FinanceAI Research</h1>
              <p className="text-sm text-slate-400">Intelligent Financial Analysis Platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 px-4 py-2 rounded-full mb-8 border border-blue-500/20">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">AI-Powered Financial Research</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Advanced Financial
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Intelligence Platform
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Harness the power of AI to conduct comprehensive financial research, analyze market data, 
            and generate professional investment reports with multi-source intelligence gathering.
          </p>

          {/* Search Interface */}
          <div className="max-w-4xl mx-auto mb-16">
            <SearchInput
              value={query}
              onChange={handleQueryChange}
              onSearch={handleSearch}
              isProcessing={isProcessing}
            />
            <ProcessingStatus
              isProcessing={isProcessing}
              status={status}
              result={result}
              progress={progress}
              onStop={handleStop}
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Platform Capabilities</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our AI system combines multiple specialized tools and intelligent analysis to deliver comprehensive financial insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:border-slate-600/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg text-blue-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold text-white mb-2">Query Analysis</h3>
              <p className="text-slate-400 text-sm">AI analyzes your research query and creates an optimal search strategy</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Source Research</h3>
              <p className="text-slate-400 text-sm">Parallel execution of web search, financial data, and news gathering</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold text-white mb-2">Intelligent Analysis</h3>
              <p className="text-slate-400 text-sm">Content summarization, gap analysis, and iterative research refinement</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">4</div>
              <h3 className="text-lg font-semibold text-white mb-2">Report Generation</h3>
              <p className="text-slate-400 text-sm">Professional investment analysis documents with structured insights</p>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Powered by Premium Data Sources</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300">Tavily Web Search</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <span className="text-slate-300">Yahoo Finance</span>
            </div>
            <div className="flex items-center space-x-2">
              <Newspaper className="w-5 h-5 text-orange-400" />
              <span className="text-slate-300">NewsData.io</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-slate-300">Ollama AI Models</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
