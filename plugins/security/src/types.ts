export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface SecurityIssue {
  id: string;
  category:
    | 'env'
    | 'headers'
    | 'dependencies'
    | 'storage'
    | 'scripts'
    | 'html'
    | 'dom'
    | 'files'
    | 'mixed-content'
    | 'server-response';
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
  location?: string; // E.g., variable name or package name
}

/**
 * Protocol definition for Security plugin
 */
export interface SecurityProtocol {
  // Events sent from App to Client
  'scan-results': (data: {
    data: SecurityIssue[];
    url: string;
  }) => void;
}

export interface AuditSummary {
  vulnerabilities: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
    info: number;
  };
  totalDependencies: number;
}
