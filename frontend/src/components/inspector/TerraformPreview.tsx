import { useState, useMemo } from 'react';
import { Code2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TerraformPreviewProps {
  terraformFiles: Record<string, string>;
}

export default function TerraformPreview({ terraformFiles }: TerraformPreviewProps) {
  const [selectedTerraformFile, setSelectedTerraformFile] = useState<string>('main.tf');

  // Get ordered list of terraform files for display
  const sortedTerraformFiles = useMemo(() => {
    const files = Object.keys(terraformFiles);
    if (files.length === 0) return [];

    // Priority order for displaying files (main.tf first to show resources)
    const priority = [
      'main.tf',
      'providers.tf',
      'variables.tf',
      'outputs.tf',
      'terraform.tfvars',
    ];

    return files.sort((a, b) => {
      const aIndex = priority.indexOf(a);
      const bIndex = priority.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [terraformFiles]);

  // Get content of selected file
  const selectedFileContent = useMemo(() => {
    if (sortedTerraformFiles.length === 0) {
      return '# No Terraform code generated yet\n# Add resources and save to generate code';
    }
    // If selected file doesn't exist, default to first file
    const fileToShow = terraformFiles[selectedTerraformFile]
      ? selectedTerraformFile
      : sortedTerraformFiles[0];
    return terraformFiles[fileToShow] || '# File content not available';
  }, [terraformFiles, selectedTerraformFile, sortedTerraformFiles]);

  if (Object.keys(terraformFiles).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
        <Code2 className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
        <p className="text-sm font-medium">No code generated</p>
        <p className="text-xs mt-2 text-center text-gray-400">
          Add resources and save to generate Terraform code
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* File selector tabs */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto hide-scrollbar">
          {sortedTerraformFiles.map((file) => {
            const shortName = file.split('/').pop() || file;
            const isSelected = selectedTerraformFile === file ||
              (!terraformFiles[selectedTerraformFile] && file === sortedTerraformFiles[0]);
            return (
              <button
                key={file}
                onClick={() => setSelectedTerraformFile(file)}
                className={`flex-shrink-0 px-2 py-1 text-[10px] font-mono rounded transition-colors ${
                  isSelected
                    ? 'bg-[#714EFF] text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
                title={file}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      </div>
      {/* File content */}
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language="hcl"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '11px',
            lineHeight: '1.5',
            minHeight: '100%',
          }}
          showLineNumbers
        >
          {selectedFileContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
