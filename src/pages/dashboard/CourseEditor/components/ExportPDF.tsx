import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  FileDown, 
  Loader2,
  Printer,
  FileText,
  CheckCircle
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type CoursePlan = Database['public']['Tables']['cm_course_plans']['Row'];
type ModuleContent = Database['public']['Tables']['cm_module_content']['Row'];

interface ExportPDFProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coursePlan: CoursePlan;
  modules: ModuleContent[];
}

const ExportPDF: React.FC<ExportPDFProps> = ({
  open,
  onOpenChange,
  coursePlan,
  modules
}) => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'complete', // complete, module, sections
    selectedModules: [] as string[],
    includeTOC: true,
    includePageNumbers: true,
    includeHeaders: true,
    paperSize: 'a4' // a4, letter
  });

  const handleExport = async () => {
    setExporting(true);

    try {
      // Prepare the content for export
      const contentToExport = prepareContent();
      
      // Create HTML structure
      const html = generateHTML(contentToExport);
      
      // Create blob and download
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new window for printing/saving as PDF
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      toast({
        title: 'Export ready',
        description: 'Use your browser\'s print dialog to save as PDF',
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export course content',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  const prepareContent = () => {
    let modulesToExport = modules;
    
    if (exportOptions.format === 'module' && exportOptions.selectedModules.length > 0) {
      modulesToExport = modules.filter(m => 
        exportOptions.selectedModules.includes(m.content_id)
      );
    }
    
    return modulesToExport;
  };

  const generateHTML = (modulesToExport: ModuleContent[]) => {
    const styles = `
      <style>
        @page {
          size: ${exportOptions.paperSize === 'a4' ? 'A4' : 'letter'};
          margin: 2cm;
          ${exportOptions.includePageNumbers ? `
          @bottom-center {
            content: counter(page) " of " counter(pages);
          }
          ` : ''}
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
        }
        
        h1 { 
          color: #1a1a1a; 
          page-break-before: always;
          margin-top: 0;
        }
        
        h1:first-child {
          page-break-before: avoid;
        }
        
        h2 { color: #333; margin-top: 2em; }
        h3 { color: #555; margin-top: 1.5em; }
        
        .header {
          text-align: center;
          margin-bottom: 3em;
          page-break-after: always;
        }
        
        .module {
          page-break-before: always;
          margin-bottom: 3em;
        }
        
        .module:first-of-type {
          page-break-before: avoid;
        }
        
        .section {
          margin-bottom: 2em;
        }
        
        .toc {
          page-break-after: always;
        }
        
        .toc ul {
          list-style: none;
          padding-left: 0;
        }
        
        .toc li {
          margin: 0.5em 0;
          padding-left: 1em;
        }
        
        .toc a {
          text-decoration: none;
          color: #333;
        }
        
        code {
          background: #f4f4f4;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.9em;
        }
        
        pre {
          background: #f4f4f4;
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
        }
        
        blockquote {
          border-left: 4px solid #ddd;
          padding-left: 1em;
          margin-left: 0;
          color: #666;
        }
        
        img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1em auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 0.5em;
          text-align: left;
        }
        
        th {
          background: #f4f4f4;
          font-weight: bold;
        }
      </style>
    `;
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${coursePlan.course_title} - ${coursePlan.employee_name}</title>
        ${styles}
      </head>
      <body>
    `;
    
    // Header page
    html += `
      <div class="header">
        <h1>${coursePlan.course_title}</h1>
        <h2>Personalized Learning Path</h2>
        <p><strong>Employee:</strong> ${coursePlan.employee_name}</p>
        <p><strong>Duration:</strong> ${coursePlan.course_duration_weeks} weeks</p>
        <p><strong>Total Modules:</strong> ${coursePlan.total_modules}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
    `;
    
    // Table of Contents
    if (exportOptions.includeTOC) {
      html += `
        <div class="toc">
          <h2>Table of Contents</h2>
          <ul>
      `;
      
      modulesToExport.forEach((module, index) => {
        html += `<li>${index + 1}. ${module.module_name}</li>`;
      });
      
      html += `
          </ul>
        </div>
      `;
    }
    
    // Modules
    modulesToExport.forEach((module, index) => {
      html += `
        <div class="module">
          ${exportOptions.includeHeaders ? `
          <div style="text-align: right; color: #666; font-size: 0.9em; margin-bottom: 1em;">
            ${coursePlan.course_title} - Module ${index + 1}
          </div>
          ` : ''}
          
          <h1>Module ${index + 1}: ${module.module_name}</h1>
      `;
      
      // Introduction
      if (module.introduction) {
        html += `
          <div class="section">
            <h2>Introduction</h2>
            ${convertMarkdownToHTML(module.introduction)}
          </div>
        `;
      }
      
      // Core Content
      if (module.core_content) {
        html += `
          <div class="section">
            <h2>Core Content</h2>
            ${convertMarkdownToHTML(module.core_content)}
          </div>
        `;
      }
      
      // Practical Applications
      if (module.practical_applications) {
        html += `
          <div class="section">
            <h2>Practical Applications</h2>
            ${convertMarkdownToHTML(module.practical_applications)}
          </div>
        `;
      }
      
      // Case Studies
      if (module.case_studies) {
        html += `
          <div class="section">
            <h2>Case Studies</h2>
            ${convertMarkdownToHTML(module.case_studies)}
          </div>
        `;
      }
      
      // Assessments
      if (module.assessments) {
        html += `
          <div class="section">
            <h2>Assessments</h2>
            ${convertMarkdownToHTML(module.assessments)}
          </div>
        `;
      }
      
      html += '</div>';
    });
    
    html += `
      </body>
      </html>
    `;
    
    return html;
  };

  // Simple markdown to HTML converter
  const convertMarkdownToHTML = (markdown: string): string => {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      // Wrap in paragraphs
      .replace(/^(.+)$/gm, '<p>$1</p>')
      // Lists
      .replace(/<p>- (.+)<\/p>/g, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // Code blocks
      .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-future-green" />
            Export to PDF
          </DialogTitle>
          <DialogDescription>
            Configure your PDF export settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Export Format */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup
              value={exportOptions.format}
              onValueChange={(value) => setExportOptions({
                ...exportOptions,
                format: value
              })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="complete" id="complete" />
                <Label htmlFor="complete" className="font-normal cursor-pointer">
                  Complete course (all modules)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="module" id="module" />
                <Label htmlFor="module" className="font-normal cursor-pointer">
                  Selected modules only
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Module Selection */}
          {exportOptions.format === 'module' && (
            <div className="space-y-2">
              <Label>Select Modules</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                {modules.map((module, index) => (
                  <div key={module.content_id} className="flex items-center space-x-2">
                    <Checkbox
                      id={module.content_id}
                      checked={exportOptions.selectedModules.includes(module.content_id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setExportOptions({
                            ...exportOptions,
                            selectedModules: [...exportOptions.selectedModules, module.content_id]
                          });
                        } else {
                          setExportOptions({
                            ...exportOptions,
                            selectedModules: exportOptions.selectedModules.filter(
                              id => id !== module.content_id
                            )
                          });
                        }
                      }}
                    />
                    <Label 
                      htmlFor={module.content_id} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      Module {index + 1}: {module.module_name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            <Label>PDF Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="toc"
                  checked={exportOptions.includeTOC}
                  onCheckedChange={(checked) => setExportOptions({
                    ...exportOptions,
                    includeTOC: checked as boolean
                  })}
                />
                <Label htmlFor="toc" className="text-sm font-normal cursor-pointer">
                  Include table of contents
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="headers"
                  checked={exportOptions.includeHeaders}
                  onCheckedChange={(checked) => setExportOptions({
                    ...exportOptions,
                    includeHeaders: checked as boolean
                  })}
                />
                <Label htmlFor="headers" className="text-sm font-normal cursor-pointer">
                  Include page headers
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="numbers"
                  checked={exportOptions.includePageNumbers}
                  onCheckedChange={(checked) => setExportOptions({
                    ...exportOptions,
                    includePageNumbers: checked as boolean
                  })}
                />
                <Label htmlFor="numbers" className="text-sm font-normal cursor-pointer">
                  Include page numbers
                </Label>
              </div>
            </div>
          </div>

          {/* Paper Size */}
          <div className="space-y-2">
            <Label>Paper Size</Label>
            <Select
              value={exportOptions.paperSize}
              onValueChange={(value) => setExportOptions({
                ...exportOptions,
                paperSize: value
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || (exportOptions.format === 'module' && exportOptions.selectedModules.length === 0)}
            className="flex items-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportPDF;