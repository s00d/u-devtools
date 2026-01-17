/**
 * Code Transformer
 * Converts HTML to JSX/Vue format for copying
 */

export function transformCode(html: string, format: 'jsx' | 'vue' | 'html'): string {
  if (format === 'html') return html;

  if (format === 'vue') {
    // Vue template: в целом HTML ок, но можно почистить self-closing tags
    return html
      .replace(/<br>/gi, '<br />')
      .replace(/<img([^>]*)>/gi, '<img$1 />')
      .replace(/<input([^>]*)>/gi, '<input$1 />');
  }

  if (format === 'jsx') {
    // HTML -> JSX
    let result = html
      .replace(/\bclass=/g, 'className=')
      .replace(/\bfor=/g, 'htmlFor=')
      .replace(/\btabindex=/g, 'tabIndex=')
      .replace(/<!--(.*?)-->/g, '{/*$1*/}') // Комментарии
      .replace(/<br>/gi, '<br />')
      .replace(/<img([^>]*)>/gi, '<img$1 />')
      .replace(/<input([^>]*)>/gi, '<input$1 />')
      .replace(/<hr>/gi, '<hr />');

    // Convert style attributes to JSX format (simplified)
    result = result.replace(/style="([^"]*)"/g, (match, styleBody) => {
      // style="color: red; margin-top: 10px" -> style={{ color: 'red', marginTop: '10px' }}
      const styles = styleBody.split(';').filter((s: string) => s.trim());
      const jsxStyles = styles
        .map((s: string) => {
          const [key, value] = s.split(':').map((x: string) => x.trim());
          if (!key || !value) return null;
          const jsxKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          return `${jsxKey}: '${value}'`;
        })
        .filter(Boolean)
        .join(', ');
      return `style={{ ${jsxStyles} }}`;
    });

    return result;
  }

  return html;
}

