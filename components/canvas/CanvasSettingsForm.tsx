'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import * as Select from '@radix-ui/react-select'
import * as Label from '@radix-ui/react-label'
import * as Switch from '@radix-ui/react-switch'
import * as Toast from '@radix-ui/react-toast'
import { useState } from 'react'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  resolution: z.string(),
  background_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  show_name_tag: z.boolean(),
  auto_fit: z.boolean(),
  locked: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export interface CanvasSettingsFormProps {
  initialData: {
    name: string
    resolution: string
    background_color: string
    show_name_tag: boolean
    auto_fit: boolean
    locked: boolean
  }
  canvasId: string
}

export function CanvasSettingsForm({ initialData, canvasId }: CanvasSettingsFormProps) {
  const supabase = createClientComponentClient<Database>()
  const [open, setOpen] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [toastMessage, setToastMessage] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
      resolution: initialData.resolution,
      background_color: initialData.background_color || '#000000',
      show_name_tag: initialData.show_name_tag,
      auto_fit: initialData.auto_fit,
      locked: initialData.locked,
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const { error } = await supabase
        .from('canvas_settings')
        .update(values)
        .eq('id', canvasId)

      if (error) throw error

      setToastType('success')
      setToastMessage('Your canvas settings have been saved.')
      setOpen(true)
    } catch (error) {
      console.error('Error updating canvas settings:', error)
      setToastType('error')
      setToastMessage('Failed to update canvas settings. Please try again.')
      setOpen(true)
    }
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-2">
          <Label.Root htmlFor="name">Canvas Name</Label.Root>
          <Input
            id="name"
            {...form.register('name')}
            aria-invalid={!!form.formState.errors.name}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
          <p className="text-sm text-gray-500">A name to help you identify this canvas.</p>
        </div>

        <div className="space-y-2">
          <Label.Root htmlFor="resolution">Resolution</Label.Root>
          <Select.Root onValueChange={(value: string) => form.setValue('resolution', value)} defaultValue={form.getValues('resolution')}>
            <Select.Trigger className="w-full px-3 py-2 border rounded-md">
              <Select.Value placeholder="Select a resolution" />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content>
                <Select.Viewport>
                  <Select.Item value="HD" className="px-3 py-2 outline-none cursor-pointer hover:bg-gray-100">
                    <Select.ItemText>HD (1280x720)</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="FULL_HD" className="px-3 py-2 outline-none cursor-pointer hover:bg-gray-100">
                    <Select.ItemText>Full HD (1920x1080)</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="QHD" className="px-3 py-2 outline-none cursor-pointer hover:bg-gray-100">
                    <Select.ItemText>QHD (2560x1440)</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="4K" className="px-3 py-2 outline-none cursor-pointer hover:bg-gray-100">
                    <Select.ItemText>4K (3840x2160)</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          <p className="text-sm text-gray-500">The resolution of your canvas.</p>
        </div>

        <div className="space-y-2">
          <Label.Root htmlFor="background_color">Background Color</Label.Root>
          <div className="flex gap-2">
            <Input
              id="background_color"
              {...form.register('background_color')}
              aria-invalid={!!form.formState.errors.background_color}
            />
            <input
              type="color"
              value={form.getValues('background_color')}
              onChange={(e) => form.setValue('background_color', e.target.value)}
              className="w-12 h-10 rounded-md cursor-pointer"
            />
          </div>
          {form.formState.errors.background_color && (
            <p className="text-sm text-red-500">{form.formState.errors.background_color.message}</p>
          )}
          <p className="text-sm text-gray-500">The background color of your canvas in hex format (e.g., #000000).</p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label.Root htmlFor="show_name_tag">Show Name Tag</Label.Root>
            <p className="text-sm text-gray-500">Display your Twitch username on the canvas.</p>
          </div>
          <Switch.Root
            id="show_name_tag"
            checked={form.getValues('show_name_tag')}
            onCheckedChange={(checked: boolean) => form.setValue('show_name_tag', checked)}
            className="w-[42px] h-[25px] bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-pointer"
          >
            <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
          </Switch.Root>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label.Root htmlFor="auto_fit">Auto Fit</Label.Root>
            <p className="text-sm text-gray-500">Automatically fit the canvas to the viewer's screen.</p>
          </div>
          <Switch.Root
            id="auto_fit"
            checked={form.getValues('auto_fit')}
            onCheckedChange={(checked: boolean) => form.setValue('auto_fit', checked)}
            className="w-[42px] h-[25px] bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-pointer"
          >
            <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
          </Switch.Root>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label.Root htmlFor="locked">Lock Canvas</Label.Root>
            <p className="text-sm text-gray-500">Prevent viewers from panning and zooming the canvas.</p>
          </div>
          <Switch.Root
            id="locked"
            checked={form.getValues('locked')}
            onCheckedChange={(checked: boolean) => form.setValue('locked', checked)}
            className="w-[42px] h-[25px] bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-pointer"
          >
            <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
          </Switch.Root>
        </div>

        <Button type="submit">Save Changes</Button>
      </form>

      <Toast.Provider swipeDirection="right">
        <Toast.Root
          className={`${
            toastType === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
          } fixed bottom-4 right-4 px-4 py-3 rounded border`}
          open={open}
          onOpenChange={setOpen}
        >
          <Toast.Title className="font-bold">
            {toastType === 'success' ? 'Success!' : 'Error!'}
          </Toast.Title>
          <Toast.Description>
            {toastMessage}
          </Toast.Description>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>
    </>
  )
} 