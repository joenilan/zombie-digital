"use client"

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Plus,
    Edit,
    Save,
    X,
    Settings,
    Check,
    Shield,
    Users,
    Crown,
    Star,
    Grid3X3,
    Eye,
    Pencil,
    Key,
    Ban,
    Layers
} from '@/lib/icons'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAdminStore, type Feature, type UserRole, type PermissionLevel, type FeaturePermission } from '@/stores/useAdminStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CopyButton, DeleteButton, EditButton } from '@/components/ui/action-button'
import { getFeatureIcon } from '@/lib/icons'
import { logError } from '@/lib/debug'

interface FeatureWithPermissions extends Feature {
    permissions: FeaturePermission[]
}

const roles: UserRole[] = ['user', 'moderator', 'admin', 'owner']

const permissionLevels: { level: PermissionLevel; label: string; icon: any; color: string }[] = [
    { level: 'none', label: 'None', icon: Ban, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    { level: 'read', label: 'Read', icon: Eye, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { level: 'write', label: 'Write', icon: Pencil, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { level: 'admin', label: 'Admin', icon: Key, color: 'bg-red-500/20 text-red-400 border-red-500/30' }
]

const roleColors = {
    user: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    moderator: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    admin: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    owner: 'bg-red-500/20 text-red-400 border-red-500/30'
}

const roleIcons = {
    user: Users,
    moderator: Shield,
    admin: Crown,
    owner: Star
}

const categoryColors = {
    core: 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/30',
    streaming: 'bg-cyber-pink/20 text-cyber-pink border-cyber-pink/30',
    gaming: 'bg-cyber-purple/20 text-cyber-purple border-cyber-purple/30',
    customization: 'bg-cyber-orange/20 text-cyber-orange border-cyber-orange/30',
    admin: 'bg-red-500/20 text-red-400 border-red-500/30'
}

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

    const [featuresWithPermissions, setFeaturesWithPermissions] = useState<FeatureWithPermissions[]>([])
    const [permissionsLoading, setPermissionsLoading] = useState(true)
    const [activeView, setActiveView] = useState<'overview' | 'matrix'>('overview')

    const supabase = createClientComponentClient()

    useEffect(() => {
        if (user) {
            fetchFeaturesWithPermissions()
        }
    }, [user])

    const fetchFeaturesWithPermissions = async () => {
        try {
            setFeaturesLoading(true)
            setPermissionsLoading(true)

            // Fetch features
            const { data: featuresData, error: featuresError } = await supabase
                .from('feature_states')
                .select('*')
                .order('sort_order')

            if (featuresError) throw featuresError

            // Fetch permissions
            const { data: permissionsData, error: permissionsError } = await supabase
                .from('feature_role_permissions')
                .select('*')

            if (permissionsError) throw permissionsError

            // Combine features with their permissions
            const featuresWithPerms: FeatureWithPermissions[] = (featuresData || []).map(feature => ({
                ...feature,
                permissions: (permissionsData || []).filter(p => p.feature_id === feature.feature_id)
            }))

            setFeatures(featuresData || [])
            setFeaturesWithPermissions(featuresWithPerms)
        } catch (error) {
            logError('Error fetching features with permissions:', error)
            toast.error('Failed to load features')
        } finally {
            setFeaturesLoading(false)
            setPermissionsLoading(false)
        }
    }

    const updatePermission = async (featureId: string, role: UserRole, newLevel: PermissionLevel) => {
        try {
            const { error } = await supabase
                .from('feature_role_permissions')
                .upsert({
                    feature_id: featureId,
                    role_name: role,
                    permission_level: newLevel,
                    updated_by: user?.id,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error

            // Update local state
            setFeaturesWithPermissions(prev => prev.map(feature => {
                if (feature.feature_id === featureId) {
                    const updatedPermissions = feature.permissions.filter(p => p.role_name !== role)
                    if (newLevel !== 'none') {
                        updatedPermissions.push({
                            id: `temp-${Date.now()}`,
                            feature_id: featureId,
                            role_name: role,
                            permission_level: newLevel,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id || null
                        })
                    }
                    return { ...feature, permissions: updatedPermissions }
                }
                return feature
            }))

            toast.success(`Updated ${role} permissions for ${featuresWithPermissions.find(f => f.feature_id === featureId)?.name}`)
        } catch (error) {
            logError('Error updating permission:', error)
            toast.error('Failed to update permission')
        }
    }

    const getPermissionLevel = (feature: FeatureWithPermissions, role: UserRole): PermissionLevel => {
        const permission = feature.permissions.find(p => p.role_name === role)
        return permission?.permission_level || 'none'
    }

    const handleCreateFeature = async () => {
        if (!newFeature.name.trim() || !newFeature.feature_id.trim()) {
            toast.error('Feature name and ID are required')
            return
        }

        try {
            const { data, error } = await supabase
                .from('feature_states')
                .insert([{
                    ...newFeature,
                    updated_by: user?.id
                }])
                .select()
                .single()

            if (error) throw error

            // Create default permissions (user: write, moderator: write, admin: admin, owner: admin)
            const defaultPermissions = [
                { feature_id: data.feature_id, role_name: 'user', permission_level: 'write' },
                { feature_id: data.feature_id, role_name: 'moderator', permission_level: 'write' },
                { feature_id: data.feature_id, role_name: 'admin', permission_level: 'admin' },
                { feature_id: data.feature_id, role_name: 'owner', permission_level: 'admin' }
            ]

            await supabase
                .from('feature_role_permissions')
                .insert(defaultPermissions.map(p => ({ ...p, updated_by: user?.id })))

            setFeatures([...features, data])
            setShowNewFeatureDialog(false)
            resetNewFeature()
            toast.success('Feature created successfully')

            // Refresh to get the new permissions
            fetchFeaturesWithPermissions()
        } catch (error) {
            logError('Error creating feature:', error)
            toast.error('Failed to create feature')
        }
    }

    const handleToggleFeature = async (featureId: string, enabled: boolean) => {
        try {
            const { error } = await supabase
                .from('feature_states')
                .update({
                    enabled,
                    updated_by: user?.id,
                    updated_at: new Date().toISOString()
                })
                .eq('feature_id', featureId)

            if (error) throw error

            setFeaturesWithPermissions(prev => prev.map(feature =>
                feature.feature_id === featureId
                    ? { ...feature, enabled }
                    : feature
            ))

            toast.success(`Feature ${enabled ? 'enabled' : 'disabled'}`)
        } catch (error) {
            logError('Error toggling feature:', error)
            toast.error('Failed to update feature')
        }
    }

    const groupedFeatures = featuresWithPermissions.reduce((acc, feature) => {
        if (!acc[feature.category]) {
            acc[feature.category] = []
        }
        acc[feature.category].push(feature)
        return acc
    }, {} as Record<string, FeatureWithPermissions[]>)

    if (featuresLoading || permissionsLoading) {
        return <LoadingSpinner text="Loading feature matrix..." />
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                            <Layers className="w-8 h-8 text-cyber-cyan" />
                            Feature Permission Matrix
                        </h1>
                        <p className="text-gray-300">Advanced role-based feature access control with granular permissions.</p>
                    </div>
                    <Dialog open={showNewFeatureDialog} onOpenChange={setShowNewFeatureDialog}>
                        <DialogTrigger asChild>
                            <CopyButton icon={<Plus className="w-4 h-4" />} tooltip="Create new feature">
                                New Feature
                            </CopyButton>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Feature</DialogTitle>
                                <DialogDescription>
                                    Add a new feature with default permission settings for all roles.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="feature_id">Feature ID</Label>
                                    <Input
                                        id="feature_id"
                                        value={newFeature.feature_id}
                                        onChange={(e) => updateNewFeature({ feature_id: e.target.value.toUpperCase() })}
                                        placeholder="e.g., PROFILE_THEMES, STREAM_ALERTS"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input
                                        id="name"
                                        value={newFeature.name}
                                        onChange={(e) => updateNewFeature({ name: e.target.value })}
                                        placeholder="e.g., Profile Themes, Stream Alerts"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={newFeature.description}
                                        onChange={(e) => updateNewFeature({ description: e.target.value })}
                                        placeholder="Describe what this feature allows users to do..."
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="path">Feature Path</Label>
                                    <Input
                                        id="path"
                                        value={newFeature.path}
                                        onChange={(e) => updateNewFeature({ path: e.target.value })}
                                        placeholder="e.g., /dashboard/profile/themes"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={newFeature.category} onValueChange={(value) => updateNewFeature({ category: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="core">Core</SelectItem>
                                                <SelectItem value="streaming">Streaming</SelectItem>
                                                <SelectItem value="gaming">Gaming</SelectItem>
                                                <SelectItem value="customization">Customization</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="icon">Icon Name</Label>
                                        <Input
                                            id="icon"
                                            value={newFeature.icon}
                                            onChange={(e) => updateNewFeature({ icon: e.target.value })}
                                            placeholder="e.g., palette, bell, users"
                                        />
                                    </div>
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
                                <DeleteButton onClick={() => setShowNewFeatureDialog(false)} tooltip="Cancel">
                                    Cancel
                                </DeleteButton>
                                <CopyButton onClick={handleCreateFeature} tooltip="Create feature">
                                    Create Feature
                                </CopyButton>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            {/* View Toggle */}
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'overview' | 'matrix')} className="mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="matrix" className="flex items-center gap-2">
                        <Grid3X3 className="w-4 h-4" />
                        Permission Matrix
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 mt-8">
                    {/* Overview: Features by Category */}
                    {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-2xl font-bold text-foreground capitalize">{category} Features</h2>
                                <Badge className={(categoryColors as any)[category] || categoryColors.core}>
                                    {categoryFeatures.length} features
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categoryFeatures.map((feature, index) => (
                                    <motion.div
                                        key={feature.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card className="bg-glass/50 backdrop-blur-xl border-white/5 hover:border-cyber-cyan/30 transition-all duration-300">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-cyber-cyan/20">
                                                            {React.createElement(getFeatureIcon(feature.icon), {
                                                                className: "w-5 h-5 text-cyber-cyan"
                                                            })}
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg">{feature.name}</CardTitle>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {feature.feature_id}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={feature.enabled}
                                                        onCheckedChange={(enabled) => handleToggleFeature(feature.feature_id, enabled)}
                                                    />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription className="mb-4">
                                                    {feature.description}
                                                </CardDescription>

                                                {/* Role Permissions Summary */}
                                                <div className="space-y-2 mb-4">
                                                    <Label className="text-xs font-medium text-gray-400">ROLE PERMISSIONS</Label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {roles.map(role => {
                                                            const permission = getPermissionLevel(feature, role)
                                                            const permissionConfig = permissionLevels.find(p => p.level === permission)
                                                            const RoleIcon = roleIcons[role]

                                                            return (
                                                                <div key={role} className="flex items-center gap-2">
                                                                    <RoleIcon className="w-3 h-3 text-gray-400" />
                                                                    <span className="text-xs text-gray-400 capitalize">{role}:</span>
                                                                    <Badge className={`text-xs ${permissionConfig?.color}`}>
                                                                        {permissionConfig?.label}
                                                                    </Badge>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm text-gray-400">
                                                    <span>{feature.path}</span>
                                                    <EditButton
                                                        size="sm"
                                                        tooltip="Edit feature"
                                                        onClick={() => setEditingFeature(feature)}
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </EditButton>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </TabsContent>

                <TabsContent value="matrix" className="mt-8">
                    {/* Permission Matrix */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-glass/30 backdrop-blur-xl rounded-xl border border-white/5 p-6"
                    >
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                                <Grid3X3 className="w-5 h-5 text-cyber-cyan" />
                                Permission Matrix
                            </h3>
                            <p className="text-gray-400 text-sm">Click cells to cycle through permission levels: None → Read → Write → Admin</p>

                            {/* Legend */}
                            <div className="flex items-center gap-4 mt-4 flex-wrap">
                                {permissionLevels.map(({ level, label, icon: Icon, color }) => (
                                    <div key={level} className="flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        <Badge className={color}>
                                            {label}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="text-left p-4 font-medium text-gray-300">Feature</th>
                                        {roles.map(role => {
                                            const RoleIcon = roleIcons[role]
                                            return (
                                                <th key={role} className="text-center p-4 font-medium text-gray-300">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <RoleIcon className="w-5 h-5" />
                                                        <span className="capitalize">{role}</span>
                                                    </div>
                                                </th>
                                            )
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {featuresWithPermissions.map((feature) => (
                                        <tr key={feature.id} className="border-t border-white/5">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-cyber-cyan/20">
                                                        {React.createElement(getFeatureIcon(feature.icon), {
                                                            className: "w-4 h-4 text-cyber-cyan"
                                                        })}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-foreground">{feature.name}</div>
                                                        <div className="text-xs text-gray-400">{feature.feature_id}</div>
                                                    </div>
                                                    <Switch
                                                        checked={feature.enabled}
                                                        onCheckedChange={(enabled) => handleToggleFeature(feature.feature_id, enabled)}
                                                    />
                                                </div>
                                            </td>
                                            {roles.map(role => {
                                                const currentPermission = getPermissionLevel(feature, role)
                                                const permissionConfig = permissionLevels.find(p => p.level === currentPermission)
                                                const Icon = permissionConfig?.icon || Ban

                                                return (
                                                    <td key={role} className="p-4 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={`w-full h-12 ${permissionConfig?.color} hover:opacity-80 transition-colors`}
                                                            onClick={() => {
                                                                const currentIndex = permissionLevels.findIndex(p => p.level === currentPermission)
                                                                const nextIndex = (currentIndex + 1) % permissionLevels.length
                                                                const nextPermission = permissionLevels[nextIndex].level
                                                                updatePermission(feature.feature_id, role, nextPermission)
                                                            }}
                                                        >
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Icon className="w-4 h-4" />
                                                                <span className="text-xs">{permissionConfig?.label}</span>
                                                            </div>
                                                        </Button>
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </div>
    )
} 