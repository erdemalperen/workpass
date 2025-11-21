"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Types
interface FAQCategory {
  id: string;
  slug: string;
  label: string;
  icon_name: string;
  display_order: number;
}

interface FAQQuestion {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  display_order: number;
}

export default function AdminFAQ() {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [questions, setQuestions] = useState<FAQQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  
  // Edit/Create states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FAQCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ slug: "", label: "", icon_name: "", display_order: 0 });

  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<FAQQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState({ question: "", answer: "", display_order: 0 });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: cats, error: catsError } = await supabase
        .from("content_faq_categories")
        .select("*")
        .order("display_order");
      
      if (catsError) throw catsError;

      const { data: qs, error: qsError } = await supabase
        .from("content_faq_questions")
        .select("*")
        .order("display_order");

      if (qsError) throw qsError;

      setCategories(cats || []);
      setQuestions(qs || []);
      if (cats && cats.length > 0 && !activeTab) {
        setActiveTab(cats[0].id);
      } else if (cats && cats.length > 0 && !cats.find(c => c.id === activeTab)) {
         setActiveTab(cats[0].id);
      }
    } catch (error) {
      console.error("Error fetching FAQ data:", error);
      toast.error("Failed to load FAQ data");
    } finally {
      setLoading(false);
    }
  };

  // Category Handlers
  const handleOpenCategoryDialog = (category?: FAQCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        slug: category.slug,
        label: category.label,
        icon_name: category.icon_name,
        display_order: category.display_order
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ slug: "", label: "", icon_name: "HelpCircle", display_order: categories.length + 1 });
    }
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("content_faq_categories")
          .update(categoryForm)
          .eq("id", editingCategory.id);
        if (error) throw error;
        toast.success("Category updated");
      } else {
        const { error } = await supabase
          .from("content_faq_categories")
          .insert([categoryForm]);
        if (error) throw error;
        toast.success("Category created");
      }
      setIsCategoryDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure? This will delete all questions in this category.")) return;
    try {
      const { error } = await supabase
        .from("content_faq_categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Category deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  // Question Handlers
  const handleOpenQuestionDialog = (question?: FAQQuestion) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        question: question.question,
        answer: question.answer,
        display_order: question.display_order
      });
    } else {
      setEditingQuestion(null);
      const currentCategoryQuestions = questions.filter(q => q.category_id === activeTab);
      setQuestionForm({ question: "", answer: "", display_order: currentCategoryQuestions.length + 1 });
    }
    setIsQuestionDialogOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!activeTab) return;
    try {
      if (editingQuestion) {
        const { error } = await supabase
          .from("content_faq_questions")
          .update(questionForm)
          .eq("id", editingQuestion.id);
        if (error) throw error;
        toast.success("Question updated");
      } else {
        const { error } = await supabase
          .from("content_faq_questions")
          .insert([{ ...questionForm, category_id: activeTab }]);
        if (error) throw error;
        toast.success("Question created");
      }
      setIsQuestionDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Failed to save question");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error } = await supabase
        .from("content_faq_questions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Question deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">FAQ Management</h2>
          <p className="text-muted-foreground">Manage frequently asked questions and categories.</p>
        </div>
        <Button onClick={() => handleOpenCategoryDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="flex-wrap h-auto">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>{category.label}</CardTitle>
                  <CardDescription>
                    Slug: {category.slug} | Icon: {category.icon_name} | Order: {category.display_order}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenCategoryDialog(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Questions</h3>
                  <Button size="sm" onClick={() => handleOpenQuestionDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Question
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {questions
                    .filter(q => q.category_id === category.id)
                    .map((question) => (
                      <Card key={question.id} className="bg-muted/40">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1 flex-1">
                              <div className="font-medium flex items-center gap-2">
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">#{question.display_order}</span>
                                {question.question}
                              </div>
                              <p className="text-sm text-muted-foreground">{question.answer}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenQuestionDialog(question)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteQuestion(question.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {questions.filter(q => q.category_id === category.id).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No questions in this category yet.
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              Create or modify an FAQ category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cat-label" className="text-right">Label</Label>
              <Input id="cat-label" value={categoryForm.label} onChange={e => setCategoryForm({...categoryForm, label: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cat-slug" className="text-right">Slug</Label>
              <Input id="cat-slug" value={categoryForm.slug} onChange={e => setCategoryForm({...categoryForm, slug: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cat-icon" className="text-right">Icon Name</Label>
              <Input id="cat-icon" value={categoryForm.icon_name} onChange={e => setCategoryForm({...categoryForm, icon_name: e.target.value})} className="col-span-3" placeholder="e.g. HelpCircle" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cat-order" className="text-right">Order</Label>
              <Input id="cat-order" type="number" value={categoryForm.display_order} onChange={e => setCategoryForm({...categoryForm, display_order: parseInt(e.target.value)})} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
            <DialogDescription>
              Create or modify an FAQ question.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="q-question" className="text-right">Question</Label>
              <Input id="q-question" value={questionForm.question} onChange={e => setQuestionForm({...questionForm, question: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="q-answer" className="text-right">Answer</Label>
              <Textarea id="q-answer" value={questionForm.answer} onChange={e => setQuestionForm({...questionForm, answer: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="q-order" className="text-right">Order</Label>
              <Input id="q-order" type="number" value={questionForm.display_order} onChange={e => setQuestionForm({...questionForm, display_order: parseInt(e.target.value)})} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveQuestion}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
