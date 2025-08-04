import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={(v) => onSectionChange(v as ContentSection)}>
        <div className="border-b px-6 pt-6">
          <TabsList className="grid grid-cols-5 w-full bg-gray-100/50 p-1 rounded-full">
            {Object.entries(sectionConfig).map(([key, config]) => {
              const Icon = config.icon;
              const sectionContent = content[key as ContentSection] || '';
              const hasContent = sectionContent.trim().length > 0;
              
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className={cn(
                    "flex items-center gap-2 rounded-full transition-all",
                    "data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  )}
                >
                  <Icon className={cn("h-4 w-4", config.color)} />
                  <span className="hidden lg:inline">{config.label}</span>
                  {hasContent && (
                    <Badge variant="outline" className="h-5 px-1 text-xs">
                      {getWordCount(sectionContent)}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        
        {/* Content Area */}
        <TabsContent value={activeSection} className="m-0">
          <div className="p-6">
            {/* Section Header */}
            <div className="mb-4 flex items-center justify-between">
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
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => insertMarkdown('**', '**')}
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => insertMarkdown('*', '*')}
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => insertMarkdown('# ')}
                      title="Heading 1"
                    >
                      <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => insertMarkdown('## ')}
                      title="Heading 2"
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => insertMarkdown('- ')}
                      title="Bullet list"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => insertMarkdown('1. ')}
                      title="Numbered list"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => insertMarkdown('> ')}
                      title="Quote"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => insertMarkdown('`', '`')}
                      title="Inline code"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => insertMarkdown('[', '](url)')}
                      title="Link"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => setShowImageUpload(true)}
                      title="Insert image"
                    >
                      <ImagePlus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Markdown help
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
                  className="min-h-[400px] font-mono text-sm resize-y"
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