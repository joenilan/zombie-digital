"use client"

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Edit, Save, X, Settings, Check } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAdminStore } from '@/stores/useAdminStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function FeaturesPage() {
    const { user } = useAuthStore()
    const {
        features,
        featuresLoading,
        editingFeature,
        newFeature,
        showNewFeatureDialog,
        setFeatures,
        setFeaturesLoading,
        setEditingFeature,
        setNewFeature,
        updateNewFeature,
        setShowNewFeatureDialog,
        resetNewFeature
    } = useAdminStore()

    const supabase = createClientComponentClient()

    useEffect(() => {
        if (user) {
            fetchFeatures()
        }
    }, [user])

    const fetchFeatures = async () => {
        try {
            setFeaturesLoading(true)

            const { data, error } = await supabase
                .from('features')
                .select('*')
                .order('name')

            if (error) throw error

            setFeatures(data || [])
        } catch (error) {
            console.error('Error fetching features:', error)
            toast.error('Failed to load features')
        } finally {
            setFeaturesLoading(false)
        }
    }

    const handleCreateFeature = async () => {
        if (!newFeature.name.trim()) {
            toast.error('Feature name is required')
            return
        }

        try {
            const { data, error } = await supabase
                .from('features')
                .insert([newFeature])
                .select()
                .single()

            if (error) throw error

            setFeatures([...features, data])
            setShowNewFeatureDialog(false)
            resetNewFeature()
            toast.success('Feature created successfully')
        } catch (error) {
            console.error('Error creating feature:', error)
            toast.error('Failed to create feature')
        }
    }

    const handleUpdateFeature = async (featureId: string, updates: any) => {
        try {
            const { data, error } = await supabase
                .from('features')
                .update(updates)
                .eq('id', featureId)
                .select()
                .single()

            if (error) throw error

            setFeatures(features.map(f => f.id === featureId ? data : f))
            setEditingFeature(null)
            toast.success('Feature updated successfully')
        } catch (error) {
            console.error('Error updating feature:', error)
            toast.error('Failed to update feature')
        }
    }

    const handleToggleFeature = async (featureId: string, enabled: boolean) => {
        await handleUpdateFeature(featureId, { enabled })
    }

    if (featuresLoading) {
        return <LoadingSpinner text="Loading features..." />
    }

    return (
        <div>
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-foreground mb-2">Feature Management</h1>
                            <p className="text-gray-300">Control which features are available to users across the platform.</p>
                        </div>
                        <Dialog open={showNewFeatureDialog} onOpenChange={setShowNewFeatureDialog}>
                            <DialogTrigger asChild>
                                <Button icon={<Plus className="w-4 h-4" />}>
                                    New Feature
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Feature</DialogTitle>
                                    <DialogDescription>
                                        Add a new feature flag to control functionality across the platform.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Feature Name</Label>
                                        <Input
                                            id="name"
                                            value={newFeature.name}
                                            onChange={(e) => updateNewFeature({ name: e.target.value })}
                                            placeholder="e.g., CANVAS, SOCIALS, ANALYTICS"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={newFeature.description}
                                            onChange={(e) => updateNewFeature({ description: e.target.value })}
                                            placeholder="Describe what this feature controls..."
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="enabled"
                                            checked={newFeature.enabled}
                                            onCheckedChange={(enabled) => updateNewFeature({ enabled })}
                                        />
                                        <Label htmlFor="enabled">Enable by default</Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowNewFeatureDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateFeature}>
                                        Create Feature
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="bg-glass/50 backdrop-blur-xl border-white/5 hover:shadow-cyber-hover transition-all duration-300">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {editingFeature?.id === feature.id ? (
                                                    <Input
                                                        value={editingFeature.name}
                                                        onChange={(e) => setEditingFeature({ ...editingFeature, name: e.target.value })}
                                                        className="text-lg font-semibold"
                                                    />
                                                ) : (
                                                    <>
                                                        <Settings className="w-5 h-5" />
                                                        {feature.name}
                                                    </>
                                                )}
                                            </CardTitle>
                                            <CardDescription>
                                                {editingFeature?.id === feature.id ? (
                                                    <Textarea
                                                        value={editingFeature.description}
                                                        onChange={(e) => setEditingFeature({ ...editingFeature, description: e.target.value })}
                                                        className="mt-2"
                                                    />
                                                ) : (
                                                    feature.description
                                                )}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={feature.enabled ? "default" : "secondary"} className="ml-2">
                                            {feature.enabled ? 'Enabled' : 'Disabled'}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Feature Toggle */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Status</span>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={editingFeature?.id === feature.id ? editingFeature.enabled : feature.enabled}
                                                onCheckedChange={(enabled) => {
                                                    if (editingFeature?.id === feature.id) {
                                                        setEditingFeature({ ...editingFeature, enabled })
                                                    } else {
                                                        handleToggleFeature(feature.id, enabled)
                                                    }
                                                }}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {(editingFeature?.id === feature.id ? editingFeature.enabled : feature.enabled) ? 'On' : 'Off'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        {editingFeature?.id === feature.id ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleUpdateFeature(feature.id, {
                                                        name: editingFeature.name,
                                                        description: editingFeature.description,
                                                        enabled: editingFeature.enabled
                                                    })}
                                                    icon={<Check className="w-3 h-3" />}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingFeature(null)}
                                                    icon={<X className="w-3 h-3" />}
                                                >
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => setEditingFeature(feature)}
                                                icon={<Edit className="w-3 h-3" />}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                    </div>

                                    {/* Feature Info */}
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <div>ID: {feature.id}</div>
                                        <div>Created: {new Date(feature.created_at).toLocaleDateString()}</div>
                                        {feature.updated_at && (
                                            <div>Updated: {new Date(feature.updated_at).toLocaleDateString()}</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {features.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                <Settings className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No features configured</h3>
                            <p className="text-muted-foreground mb-6">
                                Create your first feature flag to start controlling platform functionality.
                            </p>
                            <Button onClick={() => setShowNewFeatureDialog(true)} icon={<Plus className="w-4 h-4" />}>
                                Create Feature
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
} 