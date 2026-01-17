/**
 * File Patcher for Source Code Sync
 * Safely updates class attributes in source files using line-based patching
 */

import fs from 'node:fs/promises';

export interface PatchResult {
  success: boolean;
  error?: string;
  backupPath?: string;
}

/**
 * Create backup of file before modification
 */
async function createBackup(filePath: string): Promise<string> {
  const backupPath = `${filePath}.tailwind-backup-${Date.now()}`;
  const content = await fs.readFile(filePath, 'utf-8');
  await fs.writeFile(backupPath, content, 'utf-8');
  return backupPath;
}

/**
 * Update classes in file using line-based patching
 */
export async function updateClassesInFile(
  filePath: string,
  line: number, // 1-based
  tagName: string,
  newClasses: string[],
  newTextContent?: string
): Promise<PatchResult> {
  console.log('[Tailwind Patcher] updateClassesInFile called:', {
    filePath,
    line,
    tagName,
    newClasses,
    newTextContent,
  });

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const lineIdx = line - 1;

    console.log('[Tailwind Patcher] File read:', {
      totalLines: lines.length,
      targetLineIdx: lineIdx,
      targetLine: lines[lineIdx],
    });

    if (lineIdx < 0 || lineIdx >= lines.length) {
      console.error('[Tailwind Patcher] Line out of bounds:', { lineIdx, totalLines: lines.length });
      throw new Error('Line out of bounds');
    }

    // Сканируем контекст (увеличиваем окно для поиска закрывающего тега, если нужно обновить текст)
    let buffer = '';
    let foundEnd = false;
    let linesCount = 0;
    const scanLimit = newTextContent !== undefined ? 50 : 20; // Больше строк, если нужно найти закрывающий тег

    for (let i = lineIdx; i < Math.min(lines.length, lineIdx + scanLimit); i++) {
      buffer += lines[i] + '\n';
      linesCount++;
      if (lines[i].includes('>')) {
        foundEnd = true;
        // Если не нужно обновлять текст, можем остановиться на первом >
        if (newTextContent === undefined) {
          break;
        }
      }
    }

    console.log('[Tailwind Patcher] Buffer scan:', {
      buffer: buffer.substring(0, 200), // Первые 200 символов для лога
      foundEnd,
      linesCount,
    });

    if (!foundEnd) {
      console.error('[Tailwind Patcher] Could not find tag end in buffer');
      throw new Error('Could not find tag end');
    }

    const classStr = newClasses.join(' ');
    console.log('[Tailwind Patcher] Class string:', classStr);

    // Ищем существующий атрибут class/className
    const attrRegex = /\b(class|className)\s*=\s*(["'])([\s\S]*?)\2/;
    const match = buffer.match(attrRegex);

    console.log('[Tailwind Patcher] Attribute match:', {
      found: !!match,
      match: match ? match[0] : null,
    });

    let newBuffer = buffer;

    if (match) {
      // Замена значения
      const oldValue = match[0];
      newBuffer = buffer.replace(attrRegex, `$1=$2${classStr}$2`);
      console.log('[Tailwind Patcher] Replacing existing attribute:', {
        old: oldValue,
        new: `$1=$2${classStr}$2`,
      });
    } else {
      // Вставка нового атрибута
      // Вставляем перед data-udt-loc (который мы сами добавили в памяти, но в файле его нет)
      // В файле просто ищем конец названия тега.
      // <div ...
      const tagStartMatch = buffer.match(/<([a-zA-Z0-9-:]+)/);
      console.log('[Tailwind Patcher] Tag start match:', {
        found: !!tagStartMatch,
        match: tagStartMatch ? tagStartMatch[0] : null,
      });

      if (tagStartMatch) {
        const insertPos = tagStartMatch.index! + tagStartMatch[0].length;
        const prefix = buffer.slice(0, insertPos);
        const suffix = buffer.slice(insertPos);

        // Определяем имя атрибута (React -> className)
        const isReact = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');
        const attrName = isReact ? 'className' : 'class';

        console.log('[Tailwind Patcher] Inserting new attribute:', {
          isReact,
          attrName,
          insertPos,
          prefix: prefix.substring(prefix.length - 20), // Последние 20 символов
          suffix: suffix.substring(0, 20), // Первые 20 символов
        });

        newBuffer = `${prefix} ${attrName}="${classStr}"${suffix}`;
      } else {
        console.error('[Tailwind Patcher] Could not parse tag structure');
        throw new Error('Could not parse tag structure');
      }
    }

    // --- B. UPDATE TEXT CONTENT (If provided) ---
    if (newTextContent !== undefined) {
      console.log('[Tailwind Patcher] Updating text content:', newTextContent);
      
      // 1. Find the END of the opening tag (e.g. `>`)
      const openTagEndMatch = newBuffer.match(/>/);
      
      if (openTagEndMatch) {
        const openTagEndIndex = openTagEndMatch.index! + 1;
        
        // 2. Find the START of the closing tag (e.g. `</h1>`)
        // We look for </tagName> after the opening tag
        const closingTagRegex = new RegExp(`</${tagName}\\s*>`, 'i');
        const bufferFromContent = newBuffer.substring(openTagEndIndex);
        const closingTagMatch = bufferFromContent.match(closingTagRegex);

        if (closingTagMatch) {
          const closingTagIndex = openTagEndIndex + closingTagMatch.index!;
          
          console.log('[Tailwind Patcher] Found closing tag:', {
            openTagEndIndex,
            closingTagIndex,
            contentBefore: newBuffer.substring(openTagEndIndex, closingTagIndex),
          });
          
          // Construct new buffer:
          // [Start...OpenTag>] + [New Content] + [<CloseTag...End]
          const partBefore = newBuffer.substring(0, openTagEndIndex);
          const partAfter = newBuffer.substring(closingTagIndex);
          
          newBuffer = partBefore + newTextContent + partAfter;
          
          console.log('[Tailwind Patcher] Text content updated:', {
            partBefore: partBefore.substring(partBefore.length - 30),
            newTextContent,
            partAfter: partAfter.substring(0, 30),
          });
        } else {
          console.warn(`[Tailwind Patcher] Could not find closing tag </${tagName}> to update text content.`);
        }
      } else {
        console.warn('[Tailwind Patcher] Could not find opening tag end (>) to update text content.');
      }
    }

    // Обновляем строки в массиве
    const newLines = newBuffer.split('\n');
    if (newLines[newLines.length - 1] === '') newLines.pop(); // Remove trailing empty from split

    console.log('[Tailwind Patcher] Updating lines:', {
      originalLinesCount: linesCount,
      newLinesCount: newLines.length,
      originalBuffer: buffer.substring(0, 100),
      newBuffer: newBuffer.substring(0, 100),
    });

    lines.splice(lineIdx, linesCount, ...newLines);

    // Create backup before writing
    console.log('[Tailwind Patcher] Creating backup...');
    const backupPath = await createBackup(filePath);
    console.log('[Tailwind Patcher] Backup created:', backupPath);

    console.log('[Tailwind Patcher] Writing file...');
    await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
    console.log('[Tailwind Patcher] File written successfully');

    return { success: true, backupPath };
  } catch (e: any) {
    console.error('[Tailwind Patcher] Error:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Restore file from backup
 */
export async function restoreFromBackup(backupPath: string): Promise<boolean> {
  try {
    const originalPath = backupPath.replace(/\.tailwind-backup-\d+$/, '');
    const backupContent = await fs.readFile(backupPath, 'utf-8');
    await fs.writeFile(originalPath, backupContent, 'utf-8');
    await fs.unlink(backupPath);
    return true;
  } catch {
    return false;
  }
}
