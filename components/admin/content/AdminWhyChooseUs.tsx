"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Edit, Loader2, CheckCircle2 } from "lucide-react";
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

interface Feature {
    id: string;
    feature_text: string;
    display_order: number;
}

interface Benefit {
    id: string;
    title: string;
    description: string;
    icon_name: string;
    color_gradient: string;
    display_order: number;
}

export default function AdminWhyChooseUs() {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [benefits, setBenefits] = useState<Benefit[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
    const [featureForm, setFeatureForm] = useState({ feature_text: "", display_order: 0 });

    const [isBenefitDialogOpen, setIsBenefitDialogOpen] = useState(false);
    const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
    const [benefitForm, setBenefitForm] = useState({ title: "", description: "", icon_name: "", color_gradient: "", display_order: 0 });

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: f, error: fError } = await supabase
                .from("content_why_choose_us_features")
                .select("*")
                .order("display_order");
            if (fError) throw fError;

            const { data: b, error: bError } = await supabase
                .from("content_why_choose_us_benefits")
                .select("*")
                .order("display_order");
            if (bError) throw bError;

            setFeatures(f || []);
            setBenefits(b || []);
        } catch (error) {
            console.error("Error fetching Why Choose Us data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // Feature Handlers
    const handleOpenFeatureDialog = (feature?: Feature) => {
        if (feature) {
            setEditingFeature(feature);
            setFeatureForm({
                feature_text: feature.feature_text,
                display_order: feature.display_order
            });
        } else {
            setEditingFeature(null);
            setFeatureForm({ feature_text: "", display_order: features.length + 1 });
        }
        setIsFeatureDialogOpen(true);
    };

    const handleSaveFeature = async () => {
        try {
            if (editingFeature) {
                const { error } = await supabase
                    .from("content_why_choose_us_features")
                    .update(featureForm)
                    .eq("id", editingFeature.id);
                if (error) throw error;
                toast.success("Feature updated");
            } else {
                const { error } = await supabase
                    .from("content_why_choose_us_features")
                    .insert([featureForm]);
                if (error) throw error;
                toast.success("Feature created");
            }
            setIsFeatureDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error saving feature:", error);
            toast.error("Failed to save feature");
        }
    };

    const handleDeleteFeature = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const { error } = await supabase
                .from("content_why_choose_us_features")
                .delete()
                .eq("id", id);
            if (error) throw error;
            toast.success("Feature deleted");
            fetchData();
        } catch (error) {
            console.error("Error deleting feature:", error);
            toast.error("Failed to delete feature");
        }
    };

    // Benefit Handlers
    const handleOpenBenefitDialog = (benefit?: Benefit) => {
        if (benefit) {
            setEditingBenefit(benefit);
            setBenefitForm({
                title: benefit.title,
                description: benefit.description,
                icon_name: benefit.icon_name,
                color_gradient: benefit.color_gradient,
                display_order: benefit.display_order
            });
        } else {
            setEditingBenefit(null);
            setBenefitForm({ title: "", description: "", icon_name: "Star", color_gradient: "from-blue-500/80 to-blue-600/80", display_order: benefits.length + 1 });
        }
        setIsBenefitDialogOpen(true);
    };

    const handleSaveBenefit = async () => {
        try {
            if (editingBenefit) {
                const { error } = await supabase
                    .from("content_why_choose_us_benefits")
                    .update(benefitForm)
                    .eq("id", editingBenefit.id);
                if (error) throw error;
                toast.success("Benefit updated");
            } else {
                const { error } = await supabase
                    .from("content_why_choose_us_benefits")
                    .insert([benefitForm]);
                if (error) throw error;
                toast.success("Benefit created");
            }
            setIsBenefitDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error saving benefit:", error);
            toast.error("Failed to save benefit");
        }
    };

    const handleDeleteBenefit = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const { error } = await supabase
                .from("content_why_choose_us_benefits")
                .delete()
                .eq("id", id);
            if (error) throw error;
            toast.success("Benefit deleted");
            fetchData();
        } catch (error) {
            console.error("Error deleting benefit:", error);
            toast.error("Failed to delete benefit");
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Why Choose Us Management</h2>
                    <p className="text-muted-foreground">Manage features list and benefit cards.</p>
                </div>
            </div>

            {/* Features Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Features List (Checklist)</CardTitle>
                    <Button size="sm" onClick={() => handleOpenFeatureDialog()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Feature
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {features.map((feature) => (
                            <div key={feature.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg group">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    <span>{feature.feature_text}</span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenFeatureDialog(feature)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteFeature(feature.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Benefits Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Benefit Cards</CardTitle>
                    <Button size="sm" onClick={() => handleOpenBenefitDialog()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Benefit
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {benefits.map((benefit) => (
                            <Card key={benefit.id} className="bg-muted/20">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <span className="text-xs font-mono">{benefit.icon_name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenBenefitDialog(benefit)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteBenefit(benefit.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <h4 className="font-bold mb-1">{benefit.title}</h4>
                                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                                    <div className="mt-2 text-xs text-muted-foreground truncate">
                                        Gradient: {benefit.color_gradient}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Feature Dialog */}
            <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingFeature ? "Edit Feature" : "Add Feature"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Text</Label>
                            <Input value={featureForm.feature_text} onChange={e => setFeatureForm({ ...featureForm, feature_text: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Order</Label>
                            <Input type="number" value={featureForm.display_order} onChange={e => setFeatureForm({ ...featureForm, display_order: parseInt(e.target.value) })} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFeatureDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveFeature}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Benefit Dialog */}
            <Dialog open={isBenefitDialogOpen} onOpenChange={setIsBenefitDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingBenefit ? "Edit Benefit" : "Add Benefit"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Title</Label>
                            <Input value={benefitForm.title} onChange={e => setBenefitForm({ ...benefitForm, title: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Description</Label>
                            <Textarea value={benefitForm.description} onChange={e => setBenefitForm({ ...benefitForm, description: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Icon Name</Label>
                            <Input value={benefitForm.icon_name} onChange={e => setBenefitForm({ ...benefitForm, icon_name: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Gradient</Label>
                            <Input value={benefitForm.color_gradient} onChange={e => setBenefitForm({ ...benefitForm, color_gradient: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Order</Label>
                            <Input type="number" value={benefitForm.display_order} onChange={e => setBenefitForm({ ...benefitForm, display_order: parseInt(e.target.value) })} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBenefitDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveBenefit}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
