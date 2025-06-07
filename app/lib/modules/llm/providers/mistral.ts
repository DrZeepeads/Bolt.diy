import { Mistral } from '@ai-sdk/mistral';
import type { IProviderSetting } from '~/types/model';
import { BaseProvider } from '../base-provider';
import type { ModelInfo, ProviderInfo } from '../types';

export class MistralProvider extends BaseProvider implements ProviderInfo {
  id = 'mistral';
  name = 'Mistral';
  icon = 'i-bolt:mistral'; // You might need to add this icon
  docsUrl = 'https://docs.mistral.ai/';
  isBeta = false; // Or true, depending on the current status

  staticModels: ModelInfo[] = [
    { id: 'mistral-large-latest', name: 'mistral-large-latest', label: 'Mistral Large (Latest)', provider: 'mistral', category: 'General Purpose', contextWindow: 32000, maxTokenAllowed: 16000, isMultimodal: false, isDefault: true },
    { id: 'mistral-small-latest', name: 'mistral-small-latest', label: 'Mistral Small (Latest)', provider: 'mistral', category: 'General Purpose', contextWindow: 32000, maxTokenAllowed: 16000, isMultimodal: false },
    { id: 'open-mistral-7b', name: 'open-mistral-7b', label: 'Open Mistral 7B', provider: 'mistral', category: 'General Purpose', contextWindow: 32000, maxTokenAllowed: 16000, isMultimodal: false },
    { id: 'open-mixtral-8x7b', name: 'open-mixtral-8x7b', label: 'Open Mixtral 8x7B', provider: 'mistral', category: 'General Purpose', contextWindow: 32000, maxTokenAllowed: 16000, isMultimodal: false },
  ];

  config = {
    apiKey: 'MISTRAL_API_KEY',
    baseUrlKey: 'MISTRAL_BASE_URL',
    apiTokenKey: 'MISTRAL_API_KEY',
  };

  constructor() {
    super();
  }

  getModelInstance(options: {
    model: string;
    serverEnv: Record<string, string>;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }) {
    const { model, serverEnv, apiKeys, providerSettings } = options;
    const apiKey = this.getApiKey(apiKeys, providerSettings);
    const baseUrl = this.getBaseUrl(serverEnv, providerSettings);

    if (!apiKey) {
      throw new Error('Missing Mistral API key');
    }

    return new Mistral({ apiKey, baseURL: baseUrl });
  }

  getApiKey(apiKeys?: Record<string, string>, providerSettings?: Record<string, IProviderSetting>): string | undefined {
    return apiKeys?.[this.id] ?? providerSettings?.[this.id]?.apiKey ?? undefined;
  }

  // Optional: Implement if you need to check the API key validity
  async checkApiKey(apiKey: string): Promise<boolean> {
    // Implement API key validation logic here
    // For example, make a simple API call to test the key
    try {
      const mistral = new Mistral({ apiKey });
      await mistral.chat('test'); // Or any other simple call
      return true;
    } catch (error) {
      console.error('Mistral API key validation failed:', error);
      return false;
    }
  }
}
