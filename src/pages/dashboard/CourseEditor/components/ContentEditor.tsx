import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Brain, 
  Wrench, 
  Briefcase, 
  ClipboardCheck,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Quote,
  Code,
  Heading1,
  Heading2,
  Undo,
  Redo,
  HelpCircle,
  Clock,
  ImagePlus,
  BookMarked,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import InlineImageUpload from './InlineImageUpload';
import type { Database } from '@/integrations/supabase/types';
import type { ContentSection } from '../hooks/useCourseEditor';

type ModuleContent = Database['public']['Tables']['cm_module_content']['Row'];

interface Reference {
  id: number;
  authors?: string;
  title: string;
  year?: number;
  type?: string;
  url?: string;
  publisher?: string;
  journal?: string;
  note?: string;
}

interface ContentEditorProps {
  module: ModuleContent;
  activeSection: ContentSection;
  onSectionChange: (section: ContentSection) => void;
  content: {
    introduction: string;
    core_content: string;
    practical_applications: string;
    case_studies: string;
    assessments: string;
  } | null;
  onContentChange: (section: ContentSection, content: string) => void;
  isPreviewMode: boolean;
}

const sectionConfig = {
  introduction: {
    label: 'Introduction',
    icon: BookOpen,
    color: 'text-blue-600',
    description: 'Module overview and learning objectives'
  },
  core_content: {
    label: 'Core Content',
    icon: Brain,
    color: 'text-purple-600',
    description: 'Main concepts and theoretical knowledge'
  },
  practical_applications: {
    label: 'Practical Applications',
    icon: Wrench,
    color: 'text-green-600',
    description: 'Hands-on exercises and real-world applications'
  },
  case_studies: {
    label: 'Case Studies',
    icon: Briefcase,
    color: 'text-orange-600',
    description: 'Real-world examples and scenarios'
  },
  assessments: {
    label: 'Assessments',
    icon: ClipboardCheck,
    color: 'text-red-600',
    description: 'Quizzes and knowledge checks'
  }
};

const ContentEditor: React.FC<ContentEditorProps> = ({
  module,
  activeSection,
  onSectionChange,
  content,
  onContentChange,
  isPreviewMode
}) => {
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  
  // Parse references from module's research_context
  const references = useMemo(() => {
    if (!module?.research_context) return [];
    const context = module.research_context as any;
    return context?.references || [];
  }, [module]);
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(activeSection, e.target.value);
  };
  
  const insertMarkdown = (before: string, after: string = '') => {
    if (!content) return;
    
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const currentContent = content[activeSection];
    
    const newContent = 
      currentContent.substring(0, start) + 
      before + 
      selectedText + 
      after + 
      currentContent.substring(end);
    
    onContentChange(activeSection, newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
  
  const insertReference = (refId: number) => {
    if (!content) return;
    
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const currentContent = content[activeSection];
    const referenceText = `[${refId}]`;
    
    const newContent = 
      currentContent.substring(0, start) + 
      referenceText + 
      currentContent.substring(start);
    
    onContentChange(activeSection, newContent);
    
    // Restore cursor position after reference
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + referenceText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
  
  const handleImageInsert = (imageMarkdown: string) => {
    if (!content) return;
    
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const currentContent = content[activeSection];
    
    // Insert image markdown at cursor position
    const newContent = 
      currentContent.substring(0, start) + 
      '\n' + imageMarkdown + '\n' + 
      currentContent.substring(start);
    
    onContentChange(activeSection, newContent);
    
    // Close the inline uploader
    setShowImageUpload(false);
    
    // Focus back on textarea
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + imageMarkdown.length + 2;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
  
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };
  
  const getReadingTime = (text: string) => {
    const words = getWordCount(text);
    const minutes = Math.ceil(words / 200); // Average reading speed
    return `${minutes} min read`;
  };
  
  // Process content to convert [1] style references to superscript links
  const processContentWithReferences = (text: string) => {
    if (!references || references.length === 0) return text;
    
    // Replace [1], [2], etc. with superscript links
    return text.replace(/\[(\d+)\]/g, (match, refNum) => {
      const ref = references.find((r: Reference) => r.id === parseInt(refNum));
      if (ref) {
        return `<sup><a href="#ref-${refNum}" class="reference-link" title="${ref.title}">[${refNum}]</a></sup>`;
      }
      return match;
    });
  };
  
  // Helper function to process children with references for ReactMarkdown components
  const processChildrenWithReferences = (children: any, keyPrefix: string = '') => {
    return React.Children.toArray(children).map((child, childIndex) => {
      if (typeof child === 'string') {
        const parts = child.split(/(\[\d+\])/g);
        return parts.map((part, index) => {
          const match = part.match(/\[(\d+)\]/);
          if (match) {
            const refNum = parseInt(match[1]);
            const ref = references.find((r: Reference) => r.id === refNum);
            if (ref) {
              return (
                <sup key={`${keyPrefix}${childIndex}-${index}`}>
                  <a 
                    href={`#ref-${refNum}`}
                    className="text-blue-600 hover:text-blue-800 text-xs ml-0.5"
                    title={ref.title}
                  >
                    [{refNum}]
                  </a>
                </sup>
              );
            }
          }
          return <span key={`${keyPrefix}${childIndex}-${index}`}>{part}</span>;
        });
      }
      return child;
    });
  };
  
  // Format a single reference for display
  const formatReference = (ref: Reference) => {
    let formatted = '';
    if (ref.authors) formatted += `${ref.authors}. `;
    if (ref.year) formatted += `(${ref.year}). `;
    formatted += `**${ref.title}**. `;
    if (ref.journal) formatted += `*${ref.journal}*. `;
    if (ref.publisher) formatted += `${ref.publisher}. `;
    if (ref.url) formatted += `[Link](${ref.url})`;
    return formatted;
  };
  
  if (!content) return null;
  
  const currentContent = content[activeSection] || '';
  const wordCount = getWordCount(currentContent);
  const readingTime = getReadingTime(currentContent);
  
  return (
    <Card className="bg-card rounded-lg shadow-sm">
      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={(v) => onSectionChange(v as ContentSection)}>
        <div className="border-b px-4 pt-3">
          <TabsList className="w-full justify-start gap-2 bg-transparent p-0 rounded-none">
            {Object.entries(sectionConfig).map(([key, config]) => {
              const Icon = config.icon;
              const sectionContent = content[key as ContentSection] || '';
              const hasContent = sectionContent.trim().length > 0;
              
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className={cn(
                    "px-2 py-2 rounded-none border-b-2 border-transparent",
                    "data-[state=active]:border-primary"
                  )}
                >
                  <Icon className={cn("h-4 w-4 mr-1", config.color)} />
                  <span className="text-sm">{config.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        
        {/* Content Area */}
        <TabsContent value={activeSection} className="m-0">
          <div className="p-4">
            {/* Section Header */}
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {React.createElement(sectionConfig[activeSection].icon, {
                    className: cn("h-5 w-5", sectionConfig[activeSection].color)
                  })}
                  {sectionConfig[activeSection].label}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {sectionConfig[activeSection].description}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readingTime}
                </span>
                <span>{wordCount} words</span>
              </div>
            </div>
            
            {/* Editor/Preview */}
            {isPreviewMode ? (
              <div className="prose prose-sm dark:prose-invert max-w-none 
                prose-headings:font-semibold
                prose-h1:text-2xl prose-h1:mt-6 prose-h1:mb-4
                prose-h2:text-xl prose-h2:mt-5 prose-h2:mb-3
                prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
                prose-h4:text-base prose-h4:mt-3 prose-h4:mb-2
                prose-p:text-sm prose-p:leading-relaxed prose-p:mb-3
                prose-ul:my-3 prose-ol:my-3
                prose-li:text-sm prose-li:leading-relaxed
                prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic
                prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-muted prose-pre:border prose-pre:border-border
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:font-semibold prose-strong:text-foreground
                prose-img:rounded-lg prose-img:shadow-md">
                {currentContent ? (
                  <div>
                    {/* Content with inline references */}
                    <ReactMarkdown
                      components={{
                        img: ({ node, ...props }) => (
                          <img {...props} className="max-w-full rounded-lg shadow-md my-4" />
                        ),
                        h1: ({ node, ...props }) => (
                          <h1 {...props} className="text-2xl font-semibold mt-6 mb-4" />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 {...props} className="text-xl font-semibold mt-5 mb-3" />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 {...props} className="text-lg font-semibold mt-4 mb-2" />
                        ),
                        h4: ({ node, ...props }) => (
                          <h4 {...props} className="text-base font-semibold mt-3 mb-2" />
                        ),
                        p: ({ node, children, ...props }) => (
                          <p {...props} className="text-sm leading-relaxed mb-3">
                            {processChildrenWithReferences(children, 'p-')}
                          </p>
                        ),
                        ul: ({ node, ...props }) => (
                          <ul {...props} className="list-disc list-inside my-3 space-y-1" />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol {...props} className="list-decimal list-inside my-3 space-y-1" />
                        ),
                        li: ({ node, children, ...props }) => (
                          <li {...props} className="text-sm leading-relaxed">
                            {processChildrenWithReferences(children, 'li-')}
                          </li>
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote {...props} className="border-l-4 border-primary/30 pl-4 italic my-4" />
                        ),
                        code: ({ node, inline, ...props }) => 
                          inline ? (
                            <code {...props} className="text-xs bg-muted px-1 py-0.5 rounded" />
                          ) : (
                            <code {...props} className="block bg-muted p-3 rounded text-xs overflow-x-auto" />
                          ),
                        a: ({ node, ...props }) => (
                          <a {...props} className="text-primary no-underline hover:underline" target="_blank" rel="noopener noreferrer" />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong {...props} className="font-semibold text-foreground" />
                        ),
                        em: ({ node, ...props }) => (
                          <em {...props} className="italic" />
                        ),
                      }}
                    >
                      {currentContent}
                    </ReactMarkdown>
                    
                    {/* References Section */}
                    {references.length > 0 && (
                      <div className="mt-8 pt-6 border-t">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <BookMarked className="h-5 w-5" />
                          References
                        </h3>
                        <div className="space-y-2">
                          {references.map((ref: Reference) => (
                            <div key={ref.id} id={`ref-${ref.id}`} className="flex gap-3 text-sm">
                              <span className="font-medium text-blue-600 min-w-[24px]">[{ref.id}]</span>
                              <div className="flex-1">
                                {ref.authors && <span>{ref.authors}. </span>}
                                {ref.year && <span>({ref.year}). </span>}
                                <span className="font-medium">{ref.title}. </span>
                                {ref.journal && <span className="italic">{ref.journal}. </span>}
                                {ref.publisher && <span>{ref.publisher}. </span>}
                                {ref.url && (
                                  <a 
                                    href={ref.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                                  >
                                    Link <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No content yet</p>
                )}
              </div>
            ) : (
              <div>
                {/* Markdown Toolbar */}
                <div className="mb-2 flex items-center gap-1 flex-wrap">
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertMarkdown('**','**')}><Bold className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Bold</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertMarkdown('*','*')}><Italic className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Italic</TooltipContent></Tooltip>
                    </TooltipProvider>
                  </div>
                  <Separator orientation="vertical" className="mx-1 h-6" />
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertMarkdown('# ')}><Heading1 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Heading 1</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertMarkdown('## ')}><Heading2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Heading 2</TooltipContent></Tooltip>
                    </TooltipProvider>
                  </div>
                  <Separator orientation="vertical" className="mx-1 h-6" />
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertMarkdown('- ')}><List className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Bullet list</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertMarkdown('1. ')}><ListOrdered className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Numbered list</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertMarkdown('> ')}><Quote className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Quote</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertMarkdown('`','`')}><Code className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Inline code</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => insertMarkdown('[','](url)')}><Link className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Link</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowImageUpload(true)}><ImagePlus className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Insert image</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowReferences(!showReferences)}><BookMarked className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Insert reference</TooltipContent></Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex-1" />
                  <Button size="sm" variant="ghost" onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}>
                    <HelpCircle className="h-4 w-4 mr-1" /> Markdown help
                  </Button>
                </div>
                
                {/* Inline Image Upload */}
                <InlineImageUpload
                  show={showImageUpload}
                  onClose={() => setShowImageUpload(false)}
                  onImageInsert={handleImageInsert}
                  planId={module.plan_id}
                  moduleId={module.module_id}
                />
                
                {/* Markdown Help */}
                {showMarkdownHelp && (
                  <Card className="mb-4 p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">Markdown Quick Reference</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <code className="bg-white px-1">**bold**</code> → <strong>bold</strong><br/>
                        <code className="bg-white px-1">*italic*</code> → <em>italic</em><br/>
                        <code className="bg-white px-1"># Heading 1</code><br/>
                        <code className="bg-white px-1">## Heading 2</code><br/>
                      </div>
                      <div>
                        <code className="bg-white px-1">- Bullet point</code><br/>
                        <code className="bg-white px-1">1. Numbered list</code><br/>
                        <code className="bg-white px-1">[Link](url)</code><br/>
                        <code className="bg-white px-1">`inline code`</code><br/>
                      </div>
                    </div>
                  </Card>
                )}
                
                {/* References Panel */}
                {showReferences && (
                  <Card className="mb-4 p-4 bg-blue-50/50 border-blue-200">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <BookMarked className="h-4 w-4" />
                      Available References
                    </h4>
                    {references.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {references.map((ref: Reference) => (
                          <div 
                            key={ref.id} 
                            className="flex items-start gap-2 p-2 rounded hover:bg-blue-100/50 cursor-pointer transition-colors"
                            onClick={() => {
                              insertReference(ref.id);
                              setShowReferences(false);
                            }}
                          >
                            <span className="text-sm font-medium text-blue-600 min-w-[24px]">[{ref.id}]</span>
                            <div className="flex-1 text-sm">
                              <div className="font-medium">{ref.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {ref.authors && <span>{ref.authors}</span>}
                                {ref.year && <span> ({ref.year})</span>}
                                {ref.type && <span className="ml-2 text-blue-600">• {ref.type}</span>}
                              </div>
                            </div>
                            {ref.url && (
                              <ExternalLink className="h-3 w-3 text-blue-500 mt-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No references available. Add references in the module settings.
                      </p>
                    )}
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-muted-foreground">
                        Click a reference to insert it at cursor position. References will appear as [1], [2], etc.
                      </p>
                    </div>
                  </Card>
                )}
                
                {/* Editor */}
                <Textarea
                  id="content-editor"
                  value={currentContent}
                  onChange={handleTextareaChange}
                  className="min-h-[360px] font-mono text-sm resize-y"
                  placeholder={`Write your ${sectionConfig[activeSection].label.toLowerCase()} content here...`}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ContentEditor;