"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface HowItWorksStep {
    id: string;
    title: string;
    description: string;
    icon_name: string;
    color_gradient: string;
    step_number: number;
}

interface HowItWorksDetail {
    id: string;
    step_id: string;
    detail_text: string;
    display_order: number;
}

export default function AdminHowItWorks() {
    const [steps, setSteps] = useState<HowItWorksStep[]>([]);
    const [details, setDetails] = useState<HowItWorksDetail[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
    const [editingStep, setEditingStep] = useState<HowItWorksStep | null>(null);
    const [stepForm, setStepForm] = useState({ title: "", description: "", icon_name: "", color_gradient: "", step_number: 0 });

    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [editingDetail, setEditingDetail] = useState<HowItWorksDetail | null>(null);
    const [activeStepId, setActiveStepId] = useState<string | null>(null);
    const [detailForm, setDetailForm] = useState({ detail_text: "", display_order: 0 });

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: s, error: sError } = await supabase
                .from("content_how_it_works_steps")
                .select("*")
                .order("step_number");
            if (sError) throw sError;

            const { data: d, error: dError } = await supabase
                .from("content_how_it_works_details")
                .select("*")
                .order("display_order");
            if (dError) throw dError;

            setSteps(s || []);
            setDetails(d || []);
        } catch (error) {
            console.error("Error fetching How It Works data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // Step Handlers
    const handleOpenStepDialog = (step?: HowItWorksStep) => {
        if (step) {
            setEditingStep(step);
            setStepForm({
                title: step.title,
                description: step.description,
                icon_name: step.icon_name,
                color_gradient: step.color_gradient,
                step_number: step.step_number
            });
        } else {
            setEditingStep(null);
            setStepForm({ title: "", description: "", icon_name: "Circle", color_gradient: "from-blue-500/20 to-purple-500/20", step_number: steps.length + 1 });
        }
        setIsStepDialogOpen(true);
    };

    const handleSaveStep = async () => {
        try {
            if (editingStep) {
                const { error } = await supabase
                    .from("content_how_it_works_steps")
                    .update(stepForm)
                    .eq("id", editingStep.id);
                if (error) throw error;
                toast.success("Step updated");
            } else {
                const { error } = await supabase
                    .from("content_how_it_works_steps")
                    .insert([stepForm]);
                if (error) throw error;
                toast.success("Step created");
            }
            setIsStepDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error saving step:", error);
            toast.error("Failed to save step");
        }
    };

    const handleDeleteStep = async (id: string) => {
        if (!confirm("Are you sure? This will delete all details for this step.")) return;
        try {
            const { error } = await supabase
                .from("content_how_it_works_steps")
                .delete()
                .eq("id", id);
            if (error) throw error;
            toast.success("Step deleted");
            fetchData();
        } catch (error) {
            console.error("Error deleting step:", error);
            toast.error("Failed to delete step");
        }
    };

    // Detail Handlers
    const handleOpenDetailDialog = (stepId: string, detail?: HowItWorksDetail) => {
        setActiveStepId(stepId);
        if (detail) {
            setEditingDetail(detail);
            setDetailForm({
                detail_text: detail.detail_text,
                display_order: detail.display_order
            });
        } else {
            setEditingDetail(null);
            const currentDetails = details.filter(d => d.step_id === stepId);
            setDetailForm({ detail_text: "", display_order: currentDetails.length + 1 });
        }
        setIsDetailDialogOpen(true);
    };

    const handleSaveDetail = async () => {
        if (!activeStepId) return;
        try {
            if (editingDetail) {
                const { error } = await supabase
                    .from("content_how_it_works_details")
                    .update(detailForm)
                    .eq("id", editingDetail.id);
                if (error) throw error;
                toast.success("Detail updated");
            } else {
                const { error } = await supabase
                    .from("content_how_it_works_details")
                    .insert([{ ...detailForm, step_id: activeStepId }]);
                if (error) throw error;
                toast.success("Detail created");
            }
            setIsDetailDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error saving detail:", error);
            toast.error("Failed to save detail");
        }
    };

    const handleDeleteDetail = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const { error } = await supabase
                .from("content_how_it_works_details")
                .delete()
                .eq("id", id);
            if (error) throw error;
            toast.success("Detail deleted");
            fetchData();
        } catch (error) {
            console.error("Error deleting detail:", error);
            toast.error("Failed to delete detail");
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">How It Works Management</h2>
                    <p className="text-muted-foreground">Manage the process steps and details.</p>
                </div>
                <Button onClick={() => handleOpenStepDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Step
                </Button>
            </div>

            <div className="grid gap-6">
                {steps.map((step) => (
                    <Card key={step.id}>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm">
                                        {step.step_number}
                                    </span>
                                    {step.title}
                                </CardTitle>
                                <CardDescription>{step.description}</CardDescription>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Icon: {step.icon_name} | Gradient: {step.color_gradient}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleOpenStepDialog(step)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteStep(step.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-semibold text-muted-foreground">Details (Bullet Points)</h4>
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenDetailDialog(step.id)}>
                                        <Plus className="h-3 w-3 mr-1" /> Add
                                    </Button>
                                </div>
                                {details
                                    .filter(d => d.step_id === step.id)
                                    .map((detail) => (
                                        <div key={detail.id} className="flex items-center justify-between bg-muted/30 p-2 rounded text-sm group">
                                            <div className="flex items-center gap-2">
                                                <span className="text-primary">•</span>
                                                <span>{detail.detail_text}</span>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenDetailDialog(step.id, detail)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteDetail(detail.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Step Dialog */}
            <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingStep ? "Edit Step" : "Add Step"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Title</Label>
                            <Input value={stepForm.title} onChange={e => setStepForm({ ...stepForm, title: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Description</Label>
                            <Textarea value={stepForm.description} onChange={e => setStepForm({ ...stepForm, description: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Icon Name</Label>
                            <Input value={stepForm.icon_name} onChange={e => setStepForm({ ...stepForm, icon_name: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Gradient</Label>
                            <Input value={stepForm.color_gradient} onChange={e => setStepForm({ ...stepForm, color_gradient: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Step #</Label>
                            <Input type="number" value={stepForm.step_number} onChange={e => setStepForm({ ...stepForm, step_number: parseInt(e.target.value) })} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStepDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveStep}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingDetail ? "Edit Detail" : "Add Detail"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Text</Label>
                            <Input value={detailForm.detail_text} onChange={e => setDetailForm({ ...detailForm, detail_text: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Order</Label>
                            <Input type="number" value={detailForm.display_order} onChange={e => setDetailForm({ ...detailForm, display_order: parseInt(e.target.value) })} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveDetail}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
