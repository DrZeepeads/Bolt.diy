import { describe, it, expect, vi } from 'vitest';
import { MistralProvider } from './mistral';
import { Mistral } from '@ai-sdk/mistral';

// Mock the Mistral client
vi.mock('@ai-sdk/mistral', () => {
  const MistralChat = vi.fn();
  MistralChat.prototype.chat = vi.fn();
  return { Mistral: MistralChat };
});

describe('MistralProvider', () => {
  const provider = new MistralProvider();

  it('should have correct provider details', () => {
    expect(provider.id).toBe('mistral');
    expect(provider.name).toBe('Mistral');
    expect(provider.docsUrl).toBe('https://docs.mistral.ai/');
  });

  it('should return a Mistral instance from getModelInstance', () => {
    const modelInstance = provider.getModelInstance({
      model: 'mistral-large-latest',
      serverEnv: {},
      apiKeys: { mistral: 'test-api-key' },
    });
    expect(Mistral).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      baseURL: undefined, // Or your default base URL if defined
    });
    expect(modelInstance).toBeInstanceOf(Mistral);
  });

  it('should throw error if API key is missing in getModelInstance', () => {
    expect(() =>
      provider.getModelInstance({
        model: 'mistral-large-latest',
        serverEnv: {},
      })
    ).toThrow('Missing Mistral API key');
  });

  it('should return API key from apiKeys first', () => {
    const apiKey = provider.getApiKey({ mistral: 'key-from-apikeys' }, { mistral: { apiKey: 'key-from-settings' } });
    expect(apiKey).toBe('key-from-apikeys');
  });

  it('should return API key from providerSettings if not in apiKeys', () => {
    const apiKey = provider.getApiKey({}, { mistral: { apiKey: 'key-from-settings', enabled: true, id: 'mistral', name: 'Mistral' } });
    expect(apiKey).toBe('key-from-settings');
  });

  it('should return undefined if API key is not found', () => {
    const apiKey = provider.getApiKey({}, {});
    expect(apiKey).toBeUndefined();
  });

  // Add more tests for checkApiKey if implemented
  // For example, if checkApiKey makes an API call:
  it('checkApiKey should return true for a valid key', async () => {
    const mistralInstance = new Mistral({apiKey: 'valid-key'});
    (mistralInstance.chat as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ choices: [] }); // Mock a successful API call

    // Temporarily unmock and mock constructor for this test
    const OriginalMistral = await vi.importActual('@ai-sdk/mistral') as { Mistral: typeof Mistral };
    const constructorMock = vi.fn(() => mistralInstance);
    vi.doMock('@ai-sdk/mistral', () => ({ Mistral: constructorMock }));

    const providerToTest = new MistralProvider(); // Re-instantiate to use the new mock
    const isValid = await providerToTest.checkApiKey('valid-key');
    expect(isValid).toBe(true);
    expect(constructorMock).toHaveBeenCalledWith({ apiKey: 'valid-key' });
    expect(mistralInstance.chat).toHaveBeenCalledWith('test');

    // Restore original mock
    vi.doMock('@ai-sdk/mistral', () => {
      const MistralChat = vi.fn();
      MistralChat.prototype.chat = vi.fn();
      return { Mistral: MistralChat };
    });
  });

  it('checkApiKey should return false for an invalid key', async () => {
    const mistralInstance = new Mistral({apiKey: 'invalid-key'});
    (mistralInstance.chat as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('API error')); // Mock a failed API call

    // Temporarily unmock and mock constructor for this test
    const OriginalMistral = await vi.importActual('@ai-sdk/mistral') as { Mistral: typeof Mistral };
    const constructorMock = vi.fn(() => mistralInstance);
    vi.doMock('@ai-sdk/mistral', () => ({ Mistral: constructorMock }));

    const providerToTest = new MistralProvider(); // Re-instantiate to use the new mock
    const isValid = await providerToTest.checkApiKey('invalid-key');
    expect(isValid).toBe(false);
    expect(constructorMock).toHaveBeenCalledWith({ apiKey: 'invalid-key' });
    expect(mistralInstance.chat).toHaveBeenCalledWith('test');

    // Restore original mock
    vi.doMock('@ai-sdk/mistral', () => {
      const MistralChat = vi.fn();
      MistralChat.prototype.chat = vi.fn();
      return { Mistral: MistralChat };
    });
  });
});
