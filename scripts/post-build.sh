#!/bin/bash

# Script de post-build para Vercel
# Este script se ejecuta después del build en Vercel

echo "🚀 Ejecutando configuración post-build..."

# Verificar que Prisma Client se haya generado correctamente
if [ ! -d "node_modules/.prisma/client" ]; then
  echo "❌ Error: Prisma Client no se generó correctamente"
  exit 1
fi

echo "✅ Prisma Client generado correctamente"
echo "✅ Build completado con éxito"
