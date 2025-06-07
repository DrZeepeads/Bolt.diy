import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMistral } from '@ai-sdk/mistral';

// Mock the createMistral function and LLMManager to avoid circular dependencies
vi.mock('@ai-sdk/mistral', () => ({
  createMistral: vi.fn(() => vi.fn()),
}));

vi.mock('~/lib/modules/llm/manager', () => ({
  LLMManager: {
    getInstance: vi.fn(() => ({
      env: {},
    })),
  },
}));

describe('MistralProvider', () => {
  let MistralProvider: any;

  beforeEach(async () => {
    // Dynamic import to avoid circular dependency issues
    const module = await import('./mistral');
    MistralProvider = module.default;
  });

  it('should have correct provider details', () => {
    const provider = new MistralProvider();
    expect(provider.name).toBe('Mistral');
    expect(provider.getApiKeyLink).toBe('https://console.mistral.ai/api-keys/');
    expect(provider.config.apiTokenKey).toBe('MISTRAL_API_KEY');
  });

  it('should have correct static models', () => {
    const provider = new MistralProvider();
    expect(provider.staticModels).toHaveLength(9);
    expect(provider.staticModels[0]).toEqual({
      name: 'mistral-large-latest',
      label: 'Mistral Large (Latest)',
      provider: 'Mistral',
      maxTokenAllowed: 8000,
    });
  });

  it('should return a model instance from getModelInstance', () => {
    const provider = new MistralProvider();
    const mockMistral = vi.fn();
    const mockModel = vi.fn();
    (createMistral as any).mockReturnValue(mockMistral);
    mockMistral.mockReturnValue(mockModel);

    const modelInstance = provider.getModelInstance({
      model: 'mistral-large-latest',
      serverEnv: { MISTRAL_API_KEY: 'test-api-key' } as any,
      apiKeys: {},
    });

    expect(createMistral).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
    });
    expect(mockMistral).toHaveBeenCalledWith('mistral-large-latest');
    expect(modelInstance).toBe(mockModel);
  });

  it('should throw error if API key is missing in getModelInstance', () => {
    const provider = new MistralProvider();
    expect(() =>
      provider.getModelInstance({
        model: 'mistral-large-latest',
        serverEnv: {} as any,
        apiKeys: {},
      })
    ).toThrow('Missing API key for Mistral provider');
  });

  it('should prioritize apiKeys over environment variables', () => {
    const provider = new MistralProvider();
    const mockMistral = vi.fn();
    const mockModel = vi.fn();
    (createMistral as any).mockReturnValue(mockMistral);
    mockMistral.mockReturnValue(mockModel);

    provider.getModelInstance({
      model: 'mistral-large-latest',
      serverEnv: { MISTRAL_API_KEY: 'env-key' } as any,
      apiKeys: { Mistral: 'api-keys-key' },
    });

    expect(createMistral).toHaveBeenCalledWith({
      apiKey: 'api-keys-key',
    });
  });
});
