#!/bin/bash

# Script para sincronizar Gradle y resolver el error "Module not specified"

echo "🔄 Sincronizando Gradle..."

# Limpiar caché de Gradle
rm -rf ChatP2P/.gradle
rm -rf ChatP2P/build
rm -rf ChatP2P/app/build

# Limpiar caché de Android Studio
rm -rf ChatP2P/.idea/caches
rm -rf ChatP2P/.idea/libraries

echo "✅ Caché limpiado"

# Ejecutar gradle wrapper para sincronizar
cd ChatP2P
./gradlew clean
./gradlew build

echo "✅ Gradle sincronizado correctamente"
echo ""
echo "📝 Próximos pasos en Android Studio:"
echo "1. Abre Android Studio"
echo "2. Ve a File > Invalidate Caches / Restart"
echo "3. Selecciona 'Invalidate and Restart'"
echo "4. Espera a que se recargue"
echo "5. Ahora debería aparecer el módulo 'app' en la configuración de ejecución"
