import { describe, it, expect, vi } from 'vitest';
import { toast } from '../../src/lib/toast';

describe('Global Toast Notification System', () => {
  it('exposes all required notification methods', () => {
    expect(typeof toast.success).toBe('function');
    expect(typeof toast.error).toBe('function');
    expect(typeof toast.warning).toBe('function');
    expect(typeof toast.info).toBe('function');
    expect(typeof toast.loading).toBe('function');
    expect(typeof toast.promise).toBe('function');
    expect(typeof toast.dismiss).toBe('function');
  });

  it('handles success notification dispatch without throwing', () => {
    expect(() => {
      toast.success('Changes saved successfully!', {
        description: 'Record updated in database.',
      });
    }).not.toThrow();
  });

  it('prevents rapid duplicate toast spam for identical messages', () => {
    const msg = 'Test Deduplication Message';
    const firstCall = toast.info(msg);
    const secondCall = toast.info(msg); // Rapid second call within window

    // The second call is skipped by deduplication logic
    expect(secondCall).toBeUndefined();
  });

  it('handles error, warning, and loading notifications safely', () => {
    expect(() => toast.error('Failed to save changes. Please try again.')).not.toThrow();
    expect(() => toast.warning('You have unsaved changes.')).not.toThrow();
    expect(() => toast.loading('Saving changes...')).not.toThrow();
  });

  it('dispatches promise toast transitions correctly', async () => {
    const mockPromise = Promise.resolve({ success: true });
    expect(() => {
      toast.promise(mockPromise, {
        loading: 'Saving...',
        success: 'Saved successfully!',
        error: 'Failed to save',
      });
    }).not.toThrow();
  });
});
