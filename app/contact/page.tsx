'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Mail, User, MessageSquare } from '@/lib/icons'
import PageTransitionLayout from "@/components/PageTransitionLayout"
import { AnimatedBreadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface FormData {
    name: string
    email: string
    subject: string
    message: string
}

interface FormErrors {
    name?: string
    email?: string
    subject?: string
    message?: string
}

const contactMethods = [
    {
        title: "Support",
        description: "Technical issues or feature requests",
        icon: <AlertCircle className="w-5 h-5" />,
        color: "text-cyber-cyan"
    },
    {
        title: "Business Inquiries",
        description: "Collaboration opportunities",
        icon: <Mail className="w-5 h-5" />,
        color: "text-cyber-pink"
    },
    {
        title: "Response Time",
        description: "Usually within 24-48 hours",
        icon: <CheckCircle className="w-5 h-5" />,
        color: "text-green-400"
    }
]

export default function ContactPage() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters'
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        // Subject validation
        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required'
        } else if (formData.subject.trim().length < 5) {
            newErrors.subject = 'Subject must be at least 5 characters'
        }

        // Message validation
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required'
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error('Please fix the errors in the form')
            return
        }

        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Here you would typically send the form data to your API
            console.log('Form submitted:', formData)

            setIsSubmitted(true)
            toast.success('Message sent successfully!')

            // Reset form after successful submission
            setFormData({ name: '', email: '', subject: '', message: '' })
        } catch (error) {
            toast.error('Failed to send message. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <PageTransitionLayout>
            <div className="standard-page">
                <div className="standard-content">
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8"
                    >
                        <AnimatedBreadcrumb variant="glass" />
                    </motion.div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                            <span className="gradient-brand">Contact</span>
                            <span className="text-foreground/90"> Us</span>
                        </h1>
                        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
                            Have questions, suggestions, or want to collaborate? We'd love to hear from you!
                        </p>
                    </motion.div>

                    {/* Contact Methods */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mb-12"
                    >
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle>Get in Touch</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid-responsive-3">
                                    {contactMethods.map((method, index) => (
                                        <motion.div
                                            key={method.title}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                                            className="text-center p-4 rounded-lg bg-glass/20 border border-white/5"
                                        >
                                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-glass/30 ${method.color} mb-3`}>
                                                {method.icon}
                                            </div>
                                            <h3 className="font-heading font-semibold mb-2">{method.title}</h3>
                                            <p className="text-foreground/70 text-sm">{method.description}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Card variant="glass-interactive">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-cyber-pink" />
                                    Send us a Message
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isSubmitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8"
                                    >
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-400 mb-4">
                                            <CheckCircle className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                                        <p className="text-foreground/70 mb-4">
                                            Thank you for reaching out. We'll get back to you soon.
                                        </p>
                                        <Button
                                            onClick={() => setIsSubmitted(false)}
                                            variant="cyber-cyan"
                                        >
                                            Send Another Message
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Name Field */}
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    placeholder="Your full name"
                                                    className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                                                />
                                                {errors.name && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-400 flex items-center gap-1"
                                                    >
                                                        <AlertCircle className="w-3 h-3" />
                                                        {errors.name}
                                                    </motion.p>
                                                )}
                                            </div>

                                            {/* Email Field */}
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4" />
                                                    Email
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    placeholder="your.email@example.com"
                                                    className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                                                />
                                                {errors.email && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-sm text-red-400 flex items-center gap-1"
                                                    >
                                                        <AlertCircle className="w-3 h-3" />
                                                        {errors.email}
                                                    </motion.p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Subject Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Subject</Label>
                                            <Input
                                                id="subject"
                                                type="text"
                                                value={formData.subject}
                                                onChange={(e) => handleInputChange('subject', e.target.value)}
                                                placeholder="What's this about?"
                                                className={errors.subject ? 'border-red-500 focus:border-red-500' : ''}
                                            />
                                            {errors.subject && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-sm text-red-400 flex items-center gap-1"
                                                >
                                                    <AlertCircle className="w-3 h-3" />
                                                    {errors.subject}
                                                </motion.p>
                                            )}
                                        </div>

                                        {/* Message Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="message">Message</Label>
                                            <Textarea
                                                id="message"
                                                value={formData.message}
                                                onChange={(e) => handleInputChange('message', e.target.value)}
                                                placeholder="Tell us about your project, question, or just say hello..."
                                                rows={6}
                                                className={errors.message ? 'border-red-500 focus:border-red-500' : ''}
                                            />
                                            {errors.message && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-sm text-red-400 flex items-center gap-1"
                                                >
                                                    <AlertCircle className="w-3 h-3" />
                                                    {errors.message}
                                                </motion.p>
                                            )}
                                            <p className="text-xs text-foreground/50">
                                                {formData.message.length}/500 characters
                                            </p>
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full"
                                            variant="ethereal"
                                            icon={isSubmitting ? undefined : <Send className="w-4 h-4" />}
                                        >
                                            {isSubmitting ? 'Sending...' : 'Send Message'}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </PageTransitionLayout>
    )
} 