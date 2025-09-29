import React from 'react';
import { useRenderDebug } from '../../utils/infiniteRenderPrevention';

/**
 * @typedef {object} RenderDebugWrapperProps
 * @property {string} componentName - The name of the component being debugged.
 * @property {object} [propsToWatch={}] - An object of props to watch for changes.
 * @property {React.ReactNode} children - The child components to render.
 */

/**
 * `RenderDebugWrapper` is a utility component designed to help debug React component re-renders.
 * It logs render counts and identifies which props have changed, helping to pinpoint
 * unnecessary re-renders and potential infinite loops.
 *
 * Usage:
 * Wrap any component you suspect of re-rendering too often with this wrapper.
 *
 * Example:
 * ```jsx
 * <RenderDebugWrapper componentName="MyComponent" propsToWatch={{ data, isLoading }}>
 *   <MyComponent data={data} isLoading={isLoading} />
 * </RenderDebugWrapper>
 * ```
 *
 * The debug information will be logged to the console.
 */
const RenderDebugWrapper = ({ componentName, propsToWatch = {}, children }) => {
  useRenderDebug(componentName, propsToWatch);
  return <>{children}</>;
};

export default RenderDebugWrapper;