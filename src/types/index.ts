export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

export interface Vulnerability {
  id: string
  title: string
  severity: Severity
  line: string | null
  cwe: string | null
  owasp: string | null
  description: string
  snippet: string | null
  fix: string | null
  category: string
}

export interface ScanResult {
  id: string
  summary: string
  language: string
  linesScanned: number
  scanDuration: number
  securityScore: number
  vulnerabilities: Vulnerability[]
  createdAt: string
  fileName?: string
}

export interface ScanHistory {
  scans: ScanResult[]
}

export interface UserStats {
  totalScans: number
  criticalFound: number
  highFound: number
  avgScore: number
  languagesScanned: string[]
}
