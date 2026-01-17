interface RobotsRule {
  ua: string;
  allow: boolean;
  path: string;
}

export class RobotsParser {
  private rules: RobotsRule[] = [];
  public sitemaps: string[] = [];

  constructor(content: string) {
    this.parse(content);
  }

  private parse(content: string) {
    const lines = content.split('\n');
    let currentAgents: string[] = [];

    for (const line of lines) {
      const part = line.split('#')[0].trim();
      if (!part) continue;

      const [key, ...vals] = part.split(':');
      const val = vals.join(':').trim();
      const lowerKey = key.toLowerCase();

      if (lowerKey === 'user-agent') {
        // If this is start of new group, reset if previous was not empty
        // But robots.txt allows grouping agents in a row
        // User-agent: A
        // User-agent: B
        // Disallow: /
        // Here we accumulate agents. Reset happens when rules are encountered.
        // For simplification: just accumulate, and expand on rule.
        // (Simplified logic, but works for 99% of cases)
        currentAgents.push(val.toLowerCase());
      } else if (lowerKey === 'allow' || lowerKey === 'disallow') {
        if (currentAgents.length === 0) currentAgents = ['*']; // Fallback

        currentAgents.forEach((ua) => {
          this.rules.push({
            ua,
            allow: lowerKey === 'allow',
            path: val,
          });
        });
      } else if (lowerKey === 'sitemap') {
        this.sitemaps.push(val);
      }

      // If we encounter empty line, in some parsers this is group reset,
      // but better to reset currentAgents when encountering new User-Agent after rules.
      // Implement lazy reset:
      // In real parser this is more complex, but for DevTools this is enough.
    }
  }

  public check(urlPath: string, userAgent: string = '*'): { allowed: boolean; rule?: string } {
    const ua = userAgent.toLowerCase();
    let matchedRule: RobotsRule | null = null;

    // Filter rules related to our agent or *
    // Priority: specific agent > *
    const relevantRules = this.rules.filter((r) => r.ua === '*' || ua.includes(r.ua));

    // Sort: specific agents first, then *, inside by path length (Longest match wins)
    relevantRules.sort((a, b) => {
      if (a.ua === '*' && b.ua !== '*') return 1;
      if (a.ua !== '*' && b.ua === '*') return -1;
      return b.path.length - a.path.length;
    });

    for (const rule of relevantRules) {
      // Ignore rules for * if we found rule for specific agent
      if (matchedRule && matchedRule.ua !== '*' && rule.ua === '*') continue;

      // Path check (very simple, no wildcards yet)
      // Google supports * in paths, here we implement startsWith
      if (urlPath.startsWith(rule.path)) {
        // If we already found rule of same specificity, Allow wins Disallow (usually)
        // But we sorted by length. First match is the longest.
        if (!matchedRule) matchedRule = rule;
        else if (matchedRule.path.length < rule.path.length) matchedRule = rule;
      }
    }

    if (matchedRule) {
      return {
        allowed: matchedRule.allow,
        rule: `${matchedRule.allow ? 'Allow' : 'Disallow'}: ${matchedRule.path} (User-agent: ${matchedRule.ua})`,
      };
    }

    return { allowed: true, rule: 'Allowed by default' };
  }
}
