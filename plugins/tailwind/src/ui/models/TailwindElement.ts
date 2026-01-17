import { ref, watch, type Ref } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { AppBridge } from '@u-devtools/core';
import type { ElementState } from '../../types';
import { 
  addClass, 
  removeClass, 
  toggleClass, 
  tidyClasses 
} from '../../core/class-parser';

interface HistoryEntry {
  classes: string[];
  textContent: string;
  timestamp: number;
}

export class TailwindElement {
  // Идентификация
  public readonly id: string;
  public readonly tagName: string;
  public readonly source: ElementState['source'];
  
  // Реактивное состояние
  public classes: Ref<string[]>;
  public computedStyles: Ref<Record<string, string>>;
  public textContent: Ref<string>;
  
  // Статус
  public isDirty = ref(false);
  public isSaving = ref(false);

  // Внутренние
  private history: HistoryEntry[] = [];
  private historyIndex = -1;
  private isUndoRedoOperation = false;
  private bridge: AppBridge;
  private api: ClientApi;

  constructor(initialState: ElementState, bridgeInstance: AppBridge, api: ClientApi) {
    this.bridge = bridgeInstance;
    this.api = api;
    
    this.id = initialState.udtId;
    this.tagName = initialState.tagName;
    this.source = initialState.source;

    this.classes = ref([...initialState.classList]);
    this.computedStyles = ref(initialState.computed || {});
    this.textContent = ref(initialState.textContent || '');

    // Инициализируем историю начальным состоянием
    this.pushHistory();

    // Следим за изменениями классов и отправляем в Bridge (Live Preview)
    watch(this.classes, (newClasses, oldClasses) => {
      if (this.areClassesEqual(newClasses, oldClasses)) return;

      this.isDirty.value = true;
      this.syncToDom();
      
      if (!this.isUndoRedoOperation) {
        this.pushHistory();
      }
    }, { deep: true });

    // Следим за изменением текста
    watch(this.textContent, (newText, oldText) => {
      if (newText !== oldText) {
        this.isDirty.value = true;
      }
    });
  }

  /**
   * Обновление данных, пришедших из DOM (например, при рескане или редактировании текста в тулбаре)
   */
  public updateFromRemote(newState: ElementState) {
    this.computedStyles.value = newState.computed;
    
    // Обновляем текст, если он изменился в DOM (через contenteditable)
    if (newState.textContent !== undefined && newState.textContent !== this.textContent.value) {
      this.textContent.value = newState.textContent;
      this.isDirty.value = true;
    }

    // Если классы изменились извне (не через панель), обновляем и пушим историю
    if (!this.areClassesEqual(this.classes.value, newState.classList)) {
      this.classes.value = [...newState.classList];
      this.pushHistory();
    }
  }

  // --- API МОДИФИКАЦИИ ---

  public addClass(cls: string) {
    this.classes.value = addClass(this.classes.value, cls);
  }

  public removeClass(cls: string) {
    this.classes.value = removeClass(this.classes.value, cls);
  }

  public toggleClass(cls: string, groupRegex?: RegExp) {
    this.classes.value = toggleClass(this.classes.value, cls, groupRegex);
  }

  public setClasses(newClasses: string[]) {
    this.classes.value = [...newClasses];
  }

  public tidy() {
    this.classes.value = tidyClasses(this.classes.value);
  }

  public hasClass(cls: string): boolean {
    return this.classes.value.includes(cls);
  }

  // --- PERSISTENCE ---

  public async save() {
    console.log('[Tailwind Client] save() called', {
      hasSource: !!this.source,
      source: this.source,
      tagName: this.tagName,
      classes: this.classes.value,
    });

    if (!this.source) {
      console.error('[Tailwind Client] No source location found');
      this.api.notify('No source location found', 'error');
      return;
    }

    this.isSaving.value = true;
    // Уведомляем Тулбар, что началось сохранение
    this.bridge.send('save-status', { status: 'start' });

    try {
      const isReact = this.source.file.endsWith('.tsx') || this.source.file.endsWith('.jsx');
      const attributeName = isReact ? 'className' : 'class';

      // Определяем, нужно ли сохранять текст (простая эвристика)
      // Если это контейнер с кучей детей, innerText будет содержать кашу, лучше не трогать.
      // Если это листовой элемент (span, p, h1), сохраняем.
      const shouldSaveText = ['H1','H2','H3','H4','H5','H6','P','SPAN','A','BUTTON','LABEL','LI','TD','TH'].includes(this.tagName.toUpperCase());

      const payload = {
        filePath: this.source.file,
        line: this.source.line,
        tagName: this.tagName,
        newClasses: this.classes.value,
        attributeName,
        // Передаем текст только для текстовых элементов, чтобы не сломать разметку внутри div
        newTextContent: shouldSaveText ? this.textContent.value : undefined,
      };

      console.log('[Tailwind Client] Calling RPC tailwind:update-file with payload:', payload);

      const result = await this.api.rpc.call<{ success: boolean; error?: string }>('tailwind:update-file', payload);

      console.log('[Tailwind Client] RPC result:', result);

      if (result.success) {
        console.log('[Tailwind Client] Save successful');
        this.api.notify('Saved successfully', 'success');
        this.isDirty.value = false;
        // Уведомляем Тулбар об успехе
        this.bridge.send('save-status', { status: 'success' });
      } else {
        console.error('[Tailwind Client] Save failed:', result.error);
        this.api.notify(`Save failed: ${result.error}`, 'error');
        this.bridge.send('save-status', { status: 'error' });
      }
    } catch (e: any) {
      console.error('[Tailwind Client] Error during save:', e);
      this.api.notify(`Error: ${e.message}`, 'error');
      this.bridge.send('save-status', { status: 'error' });
    } finally {
      this.isSaving.value = false;
    }
  }

  // --- HISTORY ---

  public undo() {
    if (!this.canUndo) return;
    this.isUndoRedoOperation = true;
    this.historyIndex--;
    this.restoreState(this.history[this.historyIndex]);
    setTimeout(() => { this.isUndoRedoOperation = false; }, 0);
  }

  public redo() {
    if (!this.canRedo) return;
    this.isUndoRedoOperation = true;
    this.historyIndex++;
    this.restoreState(this.history[this.historyIndex]);
    setTimeout(() => { this.isUndoRedoOperation = false; }, 0);
  }

  public get canUndo() { return this.historyIndex > 0; }
  public get canRedo() { return this.historyIndex < this.history.length - 1; }

  // --- PRIVATE ---

  private restoreState(entry: HistoryEntry) {
    this.classes.value = [...entry.classes];
    this.textContent.value = entry.textContent;
  }

  private pushHistory() {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push({
      classes: [...this.classes.value],
      textContent: this.textContent.value,
      timestamp: Date.now()
    });
    this.historyIndex++;
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  private syncToDom() {
    this.bridge.send('update-classes', {
      udtId: this.id,
      classes: [...this.classes.value]
    });
  }

  private areClassesEqual(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}
