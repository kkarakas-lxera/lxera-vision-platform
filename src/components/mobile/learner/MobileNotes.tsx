import React, { useState, useEffect } from 'react';
import { 
  StickyNote, 
  Plus, 
  Search, 
  Filter, 
  X, 
  Edit3, 
  Save, 
  Trash2,
  Clock,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Note {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id?: string;
  title: string;
  content: string;
  timestamp?: string;
  created_at: string;
  updated_at: string;
  course?: {
    title: string;
    thumbnail_url?: string;
  };
}

export default function MobileNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    course_id: '',
    lesson_id: ''
  });
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  useEffect(() => {
    filterNotes();
  }, [notes, searchQuery, filterType]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          course:courses(title, thumbnail_url)
        `)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = [...notes];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.course?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(note => {
        if (filterType === 'course') return !note.lesson_id;
        if (filterType === 'lesson') return note.lesson_id;
        return true;
      });
    }

    setFilteredNotes(filtered);
  };

  const saveNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      const noteData = {
        ...noteForm,
        user_id: user?.id,
        lesson_id: noteForm.lesson_id || null
      };

      let result;
      if (editingNote) {
        result = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', editingNote.id)
          .select(`
            *,
            course:courses(title, thumbnail_url)
          `)
          .single();
      } else {
        result = await supabase
          .from('notes')
          .insert(noteData)
          .select(`
            *,
            course:courses(title, thumbnail_url)
          `)
          .single();
      }

      if (result.error) throw result.error;

      if (editingNote) {
        setNotes(prev => prev.map(note => 
          note.id === editingNote.id ? result.data : note
        ));
        toast.success('Note updated');
      } else {
        setNotes(prev => [result.data, ...prev]);
        toast.success('Note created');
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(n => n.id !== noteId));
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const resetForm = () => {
    setNoteForm({
      title: '',
      content: '',
      course_id: '',
      lesson_id: ''
    });
    setEditingNote(null);
  };

  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      course_id: note.course_id,
      lesson_id: note.lesson_id || ''
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mobile-notes w-full max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Notes</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StickyNote className="h-4 w-4" />
            <span>{notes.length} notes</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNote ? 'Edit Note' : 'Create Note'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Note title..."
                  value={noteForm.title}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Write your note here..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={saveNote}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingNote ? 'Update' : 'Save'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notes</SelectItem>
            <SelectItem value="course">Course Notes</SelectItem>
            <SelectItem value="lesson">Lesson Notes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <StickyNote className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery || filterType !== 'all' 
                ? 'No notes found matching your criteria'
                : 'No notes yet. Start taking notes!'}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-card rounded-lg p-4 border shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{note.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {note.course && (
                      <>
                        <BookOpen className="h-3 w-3" />
                        <span className="truncate">{note.course.title}</span>
                        <span>•</span>
                      </>
                    )}
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(note.updated_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(note)}
                    className="shrink-0 h-8 w-8"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNote(note.id)}
                    className="shrink-0 h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {note.content}
              </p>
              {note.timestamp && (
                <div className="mt-2 text-xs text-primary">
                  Taken at: {note.timestamp}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}