// =====================================================
// INFINITE RENDER PREVENTION TESTS
// Unit tests for the prevention utilities
// =====================================================

import { renderHook, act } from '@testing-library/react';
import {
  useRenderTracker,
  useInfiniteRenderGuard,
  useStableCallback,
  useStableObject,
  useDebouncedSetter,
  createStableQueryKey
} from '../utils/infiniteRenderPrevention';

// Mock console methods to avoid test output noise
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeEach(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

describe('Infinite Render Prevention Utilities', () => {
  
  describe('useRenderTracker', () => {
    it('should track render count correctly', () => {
      const { result } = renderHook(() => useRenderTracker('TestComponent', {}));
      
      expect(result.current.renderCount).toBe(1);
      
      // Re-render the hook
      renderHook(() => useRenderTracker('TestComponent', {}));
      
      // Note: renderTracker maintains state across renders
      expect(result.current.renderCount).toBeGreaterThan(0);
    });
    
    it('should detect excessive renders', () => {
      const { result } = renderHook(() => useRenderTracker('TestComponent', {}));
      
      // Simulate excessive renders
      for (let i = 0; i < 15; i++) {
        renderHook(() => useRenderTracker('TestComponent', {}));
      }
      
      // Should have detected excessive renders
      expect(console.warn).toHaveBeenCalled();
    });
  });
  
  describe('useInfiniteRenderGuard', () => {
    it('should detect infinite render loops', () => {
      const { result } = renderHook(() => useInfiniteRenderGuard('TestComponent', 5));
      
      // Simulate rapid renders
      for (let i = 0; i < 10; i++) {
        renderHook(() => useInfiniteRenderGuard('TestComponent', 5));
      }
      
      // Should have detected infinite renders
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('useStableCallback', () => {
    it('should return stable callback reference', () => {
      const callback = jest.fn();
      const { result, rerender } = renderHook(
        ({ deps }) => useStableCallback(callback, deps),
        { initialProps: { deps: [] } }
      );
      
      const firstCallback = result.current;
      
      // Re-render with same dependencies
      rerender({ deps: [] });
      
      expect(result.current).toBe(firstCallback);
    });
    
    it('should update callback when dependencies change', () => {
      const callback = jest.fn();
      const { result, rerender } = renderHook(
        ({ deps }) => useStableCallback(callback, deps),
        { initialProps: { deps: ['dep1'] } }
      );
      
      const firstCallback = result.current;
      
      // Re-render with different dependencies
      rerender({ deps: ['dep2'] });
      
      expect(result.current).not.toBe(firstCallback);
    });
  });
  
  describe('useStableObject', () => {
    it('should return stable object reference', () => {
      const obj = { key: 'value' };
      const { result, rerender } = renderHook(
        ({ deps }) => useStableObject(obj, deps),
        { initialProps: { deps: [] } }
      );
      
      const firstObject = result.current;
      
      // Re-render with same dependencies
      rerender({ deps: [] });
      
      expect(result.current).toBe(firstObject);
    });
    
    it('should update object when dependencies change', () => {
      const obj = { key: 'value' };
      const { result, rerender } = renderHook(
        ({ deps }) => useStableObject(obj, deps),
        { initialProps: { deps: ['dep1'] } }
      );
      
      const firstObject = result.current;
      
      // Re-render with different dependencies
      rerender({ deps: ['dep2'] });
      
      expect(result.current).not.toBe(firstObject);
    });
  });
  
  describe('useDebouncedSetter', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('should debounce setter calls', () => {
      const setter = jest.fn();
      const { result } = renderHook(() => useDebouncedSetter(setter, 100));
      
      // Call setter multiple times rapidly
      result.current('value1');
      result.current('value2');
      result.current('value3');
      
      // Should not have called setter yet
      expect(setter).not.toHaveBeenCalled();
      
      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // Should have called setter with last value
      expect(setter).toHaveBeenCalledTimes(1);
      expect(setter).toHaveBeenCalledWith('value3');
    });
  });
  
  describe('createStableQueryKey', () => {
    it('should create stable query key', () => {
      const { result, rerender } = renderHook(
        ({ baseKey, params }) => createStableQueryKey(baseKey, params),
        { initialProps: { baseKey: ['users'], params: { id: 1 } } }
      );
      
      const firstKey = result.current;
      
      // Re-render with same parameters
      rerender({ baseKey: ['users'], params: { id: 1 } });
      
      expect(result.current).toBe(firstKey);
    });
    
    it('should update key when parameters change', () => {
      const { result, rerender } = renderHook(
        ({ baseKey, params }) => createStableQueryKey(baseKey, params),
        { initialProps: { baseKey: ['users'], params: { id: 1 } } }
      );
      
      const firstKey = result.current;
      
      // Re-render with different parameters
      rerender({ baseKey: ['users'], params: { id: 2 } });
      
      expect(result.current).not.toBe(firstKey);
      expect(result.current).toEqual(['users', 2]);
    });
    
    it('should handle undefined parameters', () => {
      const { result } = renderHook(
        ({ baseKey, params }) => createStableQueryKey(baseKey, params),
        { initialProps: { baseKey: ['users'], params: { id: 1, name: undefined } } }
      );
      
      // Should not include undefined values
      expect(result.current).toEqual(['users', 1]);
    });
  });
});

// Integration test for the complete prevention system
describe('Integration Tests', () => {
  it('should prevent infinite renders in complex scenarios', () => {
    // This would be a more complex test that simulates real-world scenarios
    // where multiple hooks interact and could cause infinite renders
    
    const TestComponent = () => {
      const [count, setCount] = useState(0);
      const [data, setData] = useState(null);
      
      const fetchData = useStableCallback(async () => {
        setData({ count });
      }, [count]);
      
      useEffect(() => {
        fetchData();
      }, [fetchData]);
      
      const handleClick = useStableCallback(() => {
        setCount(prev => prev + 1);
      }, []);
      
      return (
        <div>
          <button onClick={handleClick}>Count: {count}</button>
          {data && <div>Data: {JSON.stringify(data)}</div>}
        </div>
      );
    };
    
    // Render the component and verify it doesn't cause infinite renders
    const { container } = render(<TestComponent />);
    
    // Click the button multiple times
    const button = container.querySelector('button');
    for (let i = 0; i < 10; i++) {
      fireEvent.click(button);
    }
    
    // Should not have caused excessive renders
    expect(console.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('Excessive renders detected')
    );
  });
});

export default {
  // Export test utilities for other test files
  renderHook,
  act
};
