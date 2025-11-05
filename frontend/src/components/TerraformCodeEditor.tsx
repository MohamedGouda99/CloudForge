import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { validateTerraformSyntax } from '../lib/terraform/codeGenerator';

interface TerraformCodeEditorProps {
  code: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  height?: string;
}

export default function TerraformCodeEditor({
  code,
  onChange,
  readOnly = false,
  height = '100%',
}: TerraformCodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [validation, setValidation] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>({ valid: true, errors: [], warnings: [] });

  useEffect(() => {
    // Validate code whenever it changes
    if (code) {
      const result = validateTerraformSyntax(code);
      setValidation(result);
    }
  }, [code]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Register Terraform language if not already registered
    if (!monaco.languages.getLanguages().some((lang: any) => lang.id === 'terraform')) {
      monaco.languages.register({ id: 'terraform' });

      // Set Terraform syntax highlighting
      monaco.languages.setMonarchTokensProvider('terraform', {
        keywords: [
          'resource', 'data', 'module', 'variable', 'output', 'locals',
          'terraform', 'provider', 'for_each', 'count', 'depends_on',
          'lifecycle', 'provisioner', 'connection', 'backend'
        ],
        typeKeywords: [
          'string', 'number', 'bool', 'list', 'map', 'set', 'object', 'tuple', 'any'
        ],
        operators: ['=', '==', '!=', '>', '<', '>=', '<=', '&&', '||', '!', '+', '-', '*', '/', '%'],
        symbols: /[=><!~?:&|+\-*\/\^%]+/,

        tokenizer: {
          root: [
            // Keywords
            [/[a-z_$][\w$]*/, {
              cases: {
                '@keywords': 'keyword',
                '@typeKeywords': 'type',
                '@default': 'identifier'
              }
            }],

            // Strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

            // Comments
            [/#.*$/, 'comment'],
            [/\/\/.*$/, 'comment'],
            [/\/\*/, 'comment', '@comment'],

            // Numbers
            [/\d+/, 'number'],

            // Delimiters and operators
            [/[{}()\[\]]/, '@brackets'],
            [/@symbols/, {
              cases: {
                '@operators': 'operator',
                '@default': ''
              }
            }],
          ],

          string: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
          ],

          comment: [
            [/[^\/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment']
          ],
        },
      });

      // Set theme
      monaco.editor.defineTheme('terraform-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: 'FF79C6', fontStyle: 'bold' },
          { token: 'string', foreground: 'F1FA8C' },
          { token: 'comment', foreground: '6272A4', fontStyle: 'italic' },
          { token: 'number', foreground: 'BD93F9' },
          { token: 'type', foreground: '8BE9FD' },
        ],
        colors: {
          'editor.background': '#1e1e1e',
        }
      });
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && onChange && !readOnly) {
      onChange(value);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">Terraform Code</span>
          {validation.valid ? (
            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">✓ Valid</span>
          ) : (
            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
              {validation.errors.length} Error{validation.errors.length !== 1 ? 's' : ''}
            </span>
          )}
          {validation.warnings.length > 0 && (
            <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
              {validation.warnings.length} Warning{validation.warnings.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {readOnly && (
            <span className="text-xs bg-gray-600 px-2 py-1 rounded">Read Only</span>
          )}
          <button
            onClick={() => {
              if (editorRef.current) {
                const text = editorRef.current.getValue();
                navigator.clipboard.writeText(text);
              }
            }}
            className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
          >
            Copy Code
          </button>
        </div>
      </div>

      {/* Validation Messages */}
      {(!validation.valid || validation.warnings.length > 0) && (
        <div className="bg-gray-900 border-b border-gray-700 max-h-32 overflow-y-auto">
          {validation.errors.map((error, i) => (
            <div key={`error-${i}`} className="px-4 py-2 text-sm text-red-400 border-b border-gray-800">
              <span className="font-semibold">Error:</span> {error}
            </div>
          ))}
          {validation.warnings.map((warning, i) => (
            <div key={`warning-${i}`} className="px-4 py-2 text-sm text-yellow-400 border-b border-gray-800">
              <span className="font-semibold">Warning:</span> {warning}
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height={height}
          defaultLanguage="terraform"
          language="terraform"
          value={code}
          onChange={handleEditorChange}
          theme="terraform-dark"
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            minimap: { enabled: true },
            fontSize: 13,
            lineNumbers: 'on',
            renderValidationDecorations: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
          }}
        />
      </div>

      {/* Footer with line count */}
      <div className="bg-gray-800 text-gray-400 px-4 py-1 text-xs border-t border-gray-700">
        {code.split('\n').length} lines • {code.length} characters
      </div>
    </div>
  );
}
