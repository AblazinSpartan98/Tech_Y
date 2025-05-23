"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface ImageUploadProps {
  defaultImage?: string
  onImageChange: (imageData: string) => void
}

export function ImageUpload({ defaultImage, onImageChange }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor, seleccione un archivo de imagen válido.")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen es demasiado grande. El tamaño máximo es 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPreviewUrl(result)
      onImageChange(result)
    }
    reader.readAsDataURL(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        {previewUrl ? (
          <div className="relative w-full max-w-xs aspect-square">
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Vista previa"
              fill
              className="object-contain rounded-md"
            />
          </div>
        ) : (
          <div className="w-full max-w-xs aspect-square bg-gray-100 flex items-center justify-center rounded-md">
            <span className="text-gray-400">Sin imagen</span>
          </div>
        )}
        <Button type="button" onClick={handleButtonClick}>
          {previewUrl ? "Cambiar imagen" : "Seleccionar imagen"}
        </Button>
      </div>
      <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  )
}
