import React, { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { AIProvider } from '../services/aiProviders/types';

interface AIProviderSelectorProps {
  onChange?: (providerId: string) => void;
}

const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({ onChange }) => {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [currentProviderId, setCurrentProviderId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 初始化时获取提供商列表
    const loadProviders = async () => {
      try {
        setIsLoading(true);
        // 获取可用的AI提供商
        const availableProviders = chatService.getAvailableProviders();
        setProviders(availableProviders);
        
        // 获取当前活跃的提供商
        const currentProvider = chatService.getCurrentProvider();
        setCurrentProviderId(currentProvider);
        
        console.log('加载AI提供商:', {
          available: availableProviders.map(p => p.id),
          current: currentProvider
        });
      } catch (error) {
        console.error('加载AI提供商失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProviders();
  }, []);

  const handleProviderChange = (providerId: string) => {
    // 更改当前提供商
    const success = chatService.setProvider(providerId);
    if (success) {
      setCurrentProviderId(providerId);
      if (onChange) {
        onChange(providerId);
      }
    } else {
      console.error(`无法切换到提供商: ${providerId}`);
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 text-sm">正在加载AI提供商...</div>;
  }

  return (
    <div className="mb-4">
      <div className="mb-2 text-white text-sm font-medium">选择AI提供商:</div>
      <div className="flex flex-wrap gap-2">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleProviderChange(provider.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              currentProviderId === provider.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
            title={provider.description}
          >
            {provider.name}
            {provider.isFree && <span className="ml-1 text-green-300">•</span>}
          </button>
        ))}
        
        {providers.length === 0 && (
          <div className="text-gray-400 text-sm">没有可用的AI提供商</div>
        )}
      </div>
    </div>
  );
};

export default AIProviderSelector; 