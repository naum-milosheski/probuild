'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
    label: string
    value: string
}

interface CustomSelectProps {
    label?: string
    value: string
    options: Option[]
    onChange: (value: string) => void
    name?: string
}

export default function CustomSelect({ label, value, options, onChange, name }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const selectRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value) || options[0]

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="space-y-2" ref={selectRef}>
            {/* Hidden input for form submission if needed */}
            {name && <input type="hidden" name={name} value={value} />}

            {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}

            <div className="relative">
                <button
                    type="button"
                    className={`input w-full text-left flex items-center justify-between cursor-pointer ${isOpen ? 'ring-2 ring-orange-500/20 border-orange-500' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="truncate text-text-primary">{selectedOption?.label}</span>
                    <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-bg-secondary border border-border-default rounded-md shadow-lg max-h-60 overflow-auto animate-fade-in">
                        <div className="p-1">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${option.value === value
                                        ? 'bg-orange-500/10 text-orange-500'
                                        : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                                        }`}
                                    onClick={() => {
                                        onChange(option.value)
                                        setIsOpen(false)
                                    }}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {option.value === value && <Check className="w-3 h-3 flex-shrink-0" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
