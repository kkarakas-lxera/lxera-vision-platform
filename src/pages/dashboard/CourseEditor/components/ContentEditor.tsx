import React, { useState } from 'react';
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
  ImagePlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageUpload from './ImageUpload';
import type { Database } from '@/integrations/supabase/types';
import type { ContentSection } from '../hooks/useCourseEditor';

type ModuleContent = Database['public']['Tables']['cm_module_content']['Row'];

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
              <div className="prose prose-sm max-w-none">
                {currentContent ? (
                  <ReactMarkdown
                    components={{
                      img: ({ node, ...props }) => (
                        <img {...props} className="max-w-full rounded-lg shadow-md my-4" />
                      )
                    }}
                  >
                    {currentContent}
                  </ReactMarkdown>
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
                    </TooltipProvider>
                  </div>
                  <div className="flex-1" />
                  <Button size="sm" variant="ghost" onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}>
                    <HelpCircle className="h-4 w-4 mr-1" /> Markdown help
                  </Button>
                </div>
                
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
      
      {/* Image Upload Dialog */}
      <ImageUpload
        open={showImageUpload}
        onOpenChange={setShowImageUpload}
        onImageInsert={handleImageInsert}
        planId={module.plan_id}
        moduleId={module.module_id}
      />
    </Card>
  );
};

export default ContentEditor;