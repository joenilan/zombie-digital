"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Feature } from '@/hooks/use-feature-access'
import {
    Settings,
    Plus,
    Edit,
    Trash2,
    Shield,
    Users,
    Crown,
    UserCheck,
    Link,
    Paintbrush,
    BarChart,
    Bell,
    ScrollText,
    Palette,
    CreditCard,
    Eye,
    EyeOff,
    Save,
    X,
    ToggleLeft,
    ToggleRight
} from 'lucide-react'

const iconMap = {
    link: Link,
    paintbrush: Paintbrush,
    'bar-chart': BarChart,
    bell: Bell,
    users: Users,
    'scroll-text': ScrollText,
    palette: Palette,
    cards: CreditCard,
    settings: Settings
}

const roleConfig = {
    user: { icon: UserCheck, color: 'text-gray-500', label: 'User' },
    moderator: { icon: Shield, color: 'text-orange-500', label: 'Moderator' },
    admin: { icon: Shield, color: 'text-red-500', label: 'Admin' },
    owner: { icon: Crown, color: 'text-yellow-500', label: 'Owner' }
}

const categoryConfig = {
    core: { label: 'Core Features', color: 'bg-blue-500' },
    streaming: { label: 'Streaming Tools', color: 'bg-purple-500' },
    admin: { label: 'Administration', color: 'bg-red-500' },
    gaming: { label: 'Gaming Features', color: 'bg-green-500' },
    customization: { label: 'Customization', color: 'bg-pink-500' },
    general: { label: 'General', color: 'bg-gray-500' }
}

interface NewFeature {
    feature_id: string
    name: string
    description: string
    path: string
    category: string
    icon: string
    required_role: 'user' | 'moderator' | 'admin' | 'owner'
    enabled: boolean
}

export default function FeaturesPage() {
    const [features, setFeatures] = useState<Feature[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null)
    const [newFeature, setNewFeature] = useState<NewFeature>({
        feature_id: '',
        name: '',
        description: '',
        path: '',
        category: 'general',
        icon: 'settings',
        required_role: 'user',
        enabled: true
    })
    const [showNewFeatureDialog, setShowNewFeatureDialog] = useState(false)
    const supabase = createClientComponentClient()

    useEffect(() => {
        fetchFeatures()
    }, [])

    const fetchFeatures = async () => {
        try {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('feature_states')
                .select('*')
                .order('sort_order', { ascending: true })

            if (error) throw error
            setFeatures(data || [])
        } catch (error) {
            console.error('Error fetching features:', error)
            toast.error('Failed to load features')
        } finally {
            setIsLoading(false)
        }
    }

    const updateFeature = async (featureId: string, updates: Partial<Feature>) => {
        try {
            const { error } = await supabase
                .from('feature_states')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', featureId)

            if (error) throw error

            setFeatures(prev => prev.map(f =>
                f.id === featureId ? { ...f, ...updates } : f
            ))

            toast.success('Feature updated successfully')
        } catch (error) {
            console.error('Error updating feature:', error)
            toast.error('Failed to update feature')
        }
    }

    const createFeature = async () => {
        try {
            const { data, error } = await supabase
                .from('feature_states')
                .insert([{
                    ...newFeature,
                    sort_order: features.length + 1
                }])
                .select()
                .single()

            if (error) throw error

            setFeatures(prev => [...prev, data])
            setNewFeature({
                feature_id: '',
                name: '',
                description: '',
                path: '',
                category: 'general',
                icon: 'settings',
                required_role: 'user',
                enabled: true
            })
            setShowNewFeatureDialog(false)
            toast.success('Feature created successfully')
        } catch (error) {
            console.error('Error creating feature:', error)
            toast.error('Failed to create feature')
        }
    }

    const deleteFeature = async (featureId: string) => {
        if (!confirm('Are you sure you want to delete this feature?')) return

        try {
            const { error } = await supabase
                .from('feature_states')
                .delete()
                .eq('id', featureId)

            if (error) throw error

            setFeatures(prev => prev.filter(f => f.id !== featureId))
            toast.success('Feature deleted successfully')
        } catch (error) {
            console.error('Error deleting feature:', error)
            toast.error('Failed to delete feature')
        }
    }

    const saveEditingFeature = async () => {
        if (!editingFeature) return

        await updateFeature(editingFeature.id, editingFeature)
        setEditingFeature(null)
    }

    const groupedFeatures = features.reduce((acc, feature) => {
        const category = feature.category || 'general'
        if (!acc[category]) acc[category] = []
        acc[category].push(feature)
        return acc
    }, {} as Record<string, Feature[]>)

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold">Feature Management</h1>
                    <p className="text-muted-foreground">Loading features...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Feature Management</h1>
                    <p className="text-muted-foreground">Control which features are available to users based on their roles</p>
                </div>

                <Dialog open={showNewFeatureDialog} onOpenChange={setShowNewFeatureDialog}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Feature
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Feature</DialogTitle>
                            <DialogDescription>
                                Add a new feature to the system with role-based access control
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="feature_id">Feature ID</Label>
                                <Input
                                    id="feature_id"
                                    value={newFeature.feature_id}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFeature(prev => ({ ...prev, feature_id: e.target.value.toUpperCase() }))}
                                    placeholder="FEATURE_NAME"
                                />
                            </div>

                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newFeature.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Feature Name"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={newFeature.description}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Feature description"
                                />
                            </div>

                            <div>
                                <Label htmlFor="path">Path</Label>
                                <Input
                                    id="path"
                                    value={newFeature.path}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFeature(prev => ({ ...prev, path: e.target.value }))}
                                    placeholder="/dashboard/feature"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={newFeature.category} onValueChange={(value) => setNewFeature(prev => ({ ...prev, category: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(categoryConfig).map(([key, config]) => (
                                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="required_role">Required Role</Label>
                                    <Select value={newFeature.required_role} onValueChange={(value: 'user' | 'moderator' | 'admin' | 'owner') => setNewFeature(prev => ({ ...prev, required_role: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(roleConfig).map(([key, config]) => (
                                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowNewFeatureDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={createFeature} disabled={!newFeature.feature_id || !newFeature.name}>
                                Create Feature
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-6">
                {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                    <Card key={category}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${categoryConfig[category as keyof typeof categoryConfig]?.color || 'bg-gray-500'}`} />
                                {categoryConfig[category as keyof typeof categoryConfig]?.label || category}
                            </CardTitle>
                            <CardDescription>
                                {categoryFeatures.length} feature{categoryFeatures.length !== 1 ? 's' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {categoryFeatures.map((feature) => {
                                    const IconComponent = iconMap[feature.icon as keyof typeof iconMap] || Settings
                                    const RoleIcon = roleConfig[feature.required_role as keyof typeof roleConfig].icon
                                    const isEditing = editingFeature?.id === feature.id

                                    return (
                                        <motion.div
                                            key={feature.id}
                                            className="flex items-center justify-between p-4 rounded-lg border bg-card"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <IconComponent className="w-5 h-5 text-muted-foreground" />
                                                    <div>
                                                        {isEditing ? (
                                                            <Input
                                                                value={editingFeature.name}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingFeature(prev => prev ? { ...prev, name: e.target.value } : null)}
                                                                className="h-8 text-sm font-medium"
                                                            />
                                                        ) : (
                                                            <h3 className="font-medium">{feature.name}</h3>
                                                        )}
                                                        {isEditing ? (
                                                            <Input
                                                                value={editingFeature.description}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingFeature(prev => prev ? { ...prev, description: e.target.value } : null)}
                                                                className="mt-1 text-sm"
                                                                placeholder="Description"
                                                            />
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <RoleIcon className={`w-4 h-4 ${roleConfig[feature.required_role as keyof typeof roleConfig].color}`} />
                                                    {isEditing ? (
                                                        <Select
                                                            value={editingFeature.required_role}
                                                            onValueChange={(value: 'user' | 'moderator' | 'admin' | 'owner') => setEditingFeature(prev => prev ? { ...prev, required_role: value } : null)}
                                                        >
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.entries(roleConfig).map(([key, config]) => (
                                                                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {roleConfig[feature.required_role as keyof typeof roleConfig].label}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {feature.enabled ? (
                                                        <Eye className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <EyeOff className="w-4 h-4 text-red-500" />
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (isEditing) {
                                                                setEditingFeature(prev => prev ? { ...prev, enabled: !prev.enabled } : null)
                                                            } else {
                                                                updateFeature(feature.id, { enabled: !feature.enabled })
                                                            }
                                                        }}
                                                    >
                                                        {(isEditing ? editingFeature.enabled : feature.enabled) ? (
                                                            <ToggleRight className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </Button>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {isEditing ? (
                                                        <>
                                                            <Button size="sm" variant="outline" onClick={saveEditingFeature}>
                                                                <Save className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => setEditingFeature(null)}>
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button size="sm" variant="outline" onClick={() => setEditingFeature(feature)}>
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => deleteFeature(feature.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
} 