import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { code, language, fileName } = await req.json()

    if (!code?.trim()) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 })
    }

    const startTime = Date.now()
    const lines = code.split('\n').length

    const prompt = `SECURITY + SYNTAX AUDIT for ${language} code:

REQUIRED JSON FORMAT (NO MARKDOWN, NO EXTRA TEXT):

\`\`\`json
{
  "language": "${language}",
  "summary": "Security + syntax summary",
  "securityScore": 85,
  "syntaxErrors": [],
  "vulnerabilities": []
}
\`\`\`

CODE:
\`\`\`${language}
${code.substring(0, 16000)}
\`\`\`

Find: secrets, injection, XSS, auth bugs, crypto flaws, syntax errors, missing commas/brackets`

    // Ollama local API (100% free)
    const ollamaRes = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'codellama:7b-instruct-q4_0',
        prompt: prompt,
        stream: false,
        options: { temperature: 0.1, top_p: 0.9 }
      })
    })

    if (!ollamaRes.ok) {
      const error = await ollamaRes.text()
      throw new Error(`Ollama error: ${error}`)
    }

    const ollamaData = await ollamaRes.json()
    const rawText = ollamaData.response || ''

    if (!rawText.trim()) {
      throw new Error('No response from Ollama')
    }

    // AI → Structured: Parse numbered list → JSON vulnerabilities
    console.log('Raw Ollama FULL:', rawText.substring(0, 1000))
    
    const parsed = {
      summary: 'AI security scan complete',
      securityScore: rawText.includes('vulnerab') ? 45 : 80,
      syntaxErrors: [],
      vulnerabilities: [],
      language
    }

    // Parse "1. Syntax error..." → syntaxErrors[]
    const syntaxR = /Syntax error[^.]*?line[^.]*?\.(.*?)(?=\n\d|\.|$)/gi
    let syntaxM
    while ((syntaxM = syntaxR.exec(rawText)) !== null) {
      parsed.syntaxErrors.push({
        line: rawText.indexOf(syntaxM[1]) > 0 ? '2-3' : 2,
        error: `Syntax: ${syntaxM[1].trim()}`,
        fix: 'Add missing ), ; or quotes'
      })
    }

    // Parse "1. Vulnerability: SQL injection..." → vulnerabilities[]
    const vulnR = /(\d+\.\s*)?(?:Vulnerability:\s*)?([A-Z]+)\s*\w*\s*vulnerability[^.]*?\.(.*?)(?=\n\d|\.|$)/gi
    let vulnM
    while ((vulnM = vulnR.exec(rawText)) !== null) {
      const sev = vulnM[2] || 'MEDIUM'
      parsed.vulnerabilities.push({
        id: `V${parsed.vulnerabilities.length + 1}`,
        title: `${sev} ${vulnM[3]?.trim().split('.')[0] || 'Issue'}`,
        severity: sev,
        category: 'AI Detection',
        description: vulnM[3]?.trim() || '',
        snippet: '',
        fix: 'Sanitize input/use prepared statements'
      })
    }

    console.log('Extracted:', parsed.vulnerabilities.length, 'vulns +', parsed.syntaxErrors.length, 'syntax')

    const scanDuration = Date.now() - startTime

    const vulns = (parsed.vulnerabilities || []).map((v: any) => ({
      ...v,
      id: v.id || uuidv4(),
    }))

    const result = {
      id: uuidv4(),
      summary: parsed.summary || 'Ollama local scan complete.',
      language: parsed.language || language,
      linesScanned: lines,
      scanDuration,
      securityScore: Math.min(100, Math.max(0, parsed.securityScore || 75)),
      syntaxErrors: parsed.syntaxErrors || [],
      vulnerabilities: vulns,
      createdAt: new Date().toISOString(),
      fileName: fileName || null,
      model: 'Ollama CodeLlama (local)'
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Ollama scan error:', err)
    return NextResponse.json({ 
      error: err.message.includes('ECONNREFUSED') 
        ? 'Ollama not running. Run: ollama serve'
        : err.message 
    }, { status: 500 })
  }
}

