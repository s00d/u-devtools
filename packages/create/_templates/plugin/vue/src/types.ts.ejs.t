---
to: <%= projectName %>/src/types.ts
---
<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>
/**
 * Protocol definition for <%= pluginName %> plugin
 */
export interface <%= pluginName.replace(/\s+/g, '') %>Protocol {
  // Events sent from App to Client
  '<%= pluginKebab %>:ready': (data: { message: string }) => void;
  <% if (features.includes('overlay')) { -%>
  '<%= pluginKebab %>:quick-action': (data: { timestamp: number }) => void;
  <% } -%>

  // Events sent from Client to App
  '<%= pluginKebab %>:action': (data: unknown) => void;
}

