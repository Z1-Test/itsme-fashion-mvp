/**
 * Component: {{ComponentName}}
 * Description: {{Description}}
 * 
 * @example
 * ```html
 * <{{tag-name}} prop="value"></{{tag-name}}>
 * ```
 */

import { html, defineElement, useState, useEffect } from '@staytunedllp/stayfront';

// =============================================================================
// TYPES
// =============================================================================

interface {{ComponentName}}Props {
  readonly prop?: string;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = `
  :host {
    display: block;
    container-type: inline-size;
  }
  
  .{{tag-name}} {
    padding: var(--intro-spacing-4);
    background: var(--intro-color-gray-50);
    border-radius: var(--intro-radius-md);
  }
  
  /* Responsive (container query) */
  @container (min-width: 37.5rem) {
    .{{tag-name}} {
      padding: var(--intro-spacing-6);
    }
  }
  
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    * {
      transition-duration: 0.01ms !important;
    }
  }
`;

// =============================================================================
// COMPONENT
// =============================================================================

export const {{componentName}} = defineElement(
  { 
    tagName: '{{tag-name}}',
    observedAttributes: ['prop']
  },
  (props: {{ComponentName}}Props) => {
    // State
    const [value, setValue] = useState('');
    
    // Effects
    useEffect(() => {
      // Setup
      return () => {
        // Cleanup
      };
    });
    
    // Handlers
    const handleClick = () => {
      setValue('clicked');
    };
    
    return html`
      <style>${styles}</style>
      <div 
        class="{{tag-name}}"
        role="region"
        aria-label="{{ComponentName}}"
      >
        <slot></slot>
        <button 
          type="button"
          onclick="${handleClick}"
          aria-label="Action button"
        >
          ${value() || props.prop || 'Click me'}
        </button>
      </div>
    `;
  }
);

{{componentName}}.register();

export type { {{ComponentName}}Props };
