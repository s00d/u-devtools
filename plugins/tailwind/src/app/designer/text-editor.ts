/**
 * Inline Text Editor
 * Enables contenteditable mode for text elements
 */

import { useBridge } from '../../context';
import { useBridgeState } from '../composables/useBridgeState';

let isEditing = false;
let originalContent: string = '';

export function enableTextEditing() {
  const bridge = useBridge();
  const { selectedElement, rescanElement } = useBridgeState(bridge);
  if (!selectedElement.value || isEditing) return;

  const el = selectedElement.value;
  
  // Basic checks
  const textElements = ['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'BUTTON', 'LABEL', 'TD', 'TH', 'LI', 'DIV'];
  if (!textElements.includes(el.tagName) && el.children.length > 0) {
    // Если элемент не текстовый и имеет детей, лучше не трогать
    return; 
  }

  isEditing = true;
  originalContent = el.innerText;

  el.contentEditable = 'true';
  el.style.outline = '2px solid #6366f1';
  el.style.outlineOffset = '2px';
  el.style.minWidth = '10px';

  el.focus();

  const finish = (save: boolean) => {
    isEditing = false;
    el.contentEditable = 'false';
    el.style.outline = '';
    el.style.outlineOffset = '';
    el.style.minWidth = '';
    
    if (!save) {
      el.innerText = originalContent;
    } else {
      // Trigger update to panel
      rescanElement(el);
    }
    
    el.removeEventListener('blur', onBlur);
    el.removeEventListener('keydown', onKeyDown);
  };

  const onBlur = () => finish(true);
  
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finish(true);
    }
    if (e.key === 'Escape') {
      finish(false);
    }
  };

  el.addEventListener('blur', onBlur);
  el.addEventListener('keydown', onKeyDown);
}

export function disableTextEditing() {
  if (isEditing) {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
}
