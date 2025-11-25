#!/bin/bash

# Script to convert all imports to use @ alias

echo "🔄 Converting imports to use @ alias..."

cd "$(dirname "$0")/src"

# Convert imports in all JSX/JS files
echo "  → Converting page files..."
find pages -name "*.jsx" -o -name "*.js" | while read file; do
  # Calculate depth to determine how many ../ to replace
  depth=$(echo "$file" | tr -cd '/' | wc -c)
  
  # Replace relative imports with @ alias
  sed -i "s|from '../../../services/|from '@/services/|g" "$file"
  sed -i "s|from '../../../../services/|from '@/services/|g" "$file"
  sed -i "s|from '../../../config/|from '@/config/|g" "$file"
  sed -i "s|from '../../../../config/|from '@/config/|g" "$file"
  sed -i "s|from '../../../stores/|from '@/stores/|g" "$file"
  sed -i "s|from '../../../../stores/|from '@/stores/|g" "$file"
  sed -i "s|from '../../../hooks/|from '@/hooks/|g" "$file"
  sed -i "s|from '../../../../hooks/|from '@/hooks/|g" "$file"
  sed -i "s|from '../../../constants|from '@/constants|g" "$file"
  sed -i "s|from '../../../../constants|from '@/constants|g" "$file"
  sed -i "s|from '../../../utils/|from '@/utils/|g" "$file"
  sed -i "s|from '../../../../utils/|from '@/utils/|g" "$file"
  sed -i "s|from '../../../components/|from '@/components/|g" "$file"
  sed -i "s|from '../../../../components/|from '@/components/|g" "$file"
  sed -i "s|from '../../components/|from '@/components/|g" "$file"
done

echo "  → Converting component files..."
find components -name "*.jsx" -o -name "*.js" | while read file; do
  sed -i "s|from '../../services/|from '@/services/|g" "$file"
  sed -i "s|from '../../../services/|from '@/services/|g" "$file"
  sed -i "s|from '../../config/|from '@/config/|g" "$file"
  sed -i "s|from '../../../config/|from '@/config/|g" "$file"
  sed -i "s|from '../../stores/|from '@/stores/|g" "$file"
  sed -i "s|from '../../../stores/|from '@/stores/|g" "$file"
  sed -i "s|from '../../hooks/|from '@/hooks/|g" "$file"
  sed -i "s|from '../../../hooks/|from '@/hooks/|g" "$file"
  sed -i "s|from '../../constants|from '@/constants|g" "$file"
  sed -i "s|from '../../../constants|from '@/constants|g" "$file"
  sed -i "s|from '../../utils/|from '@/utils/|g" "$file"
  sed -i "s|from '../../../utils/|from '@/utils/|g" "$file"
done

cd ..

echo "✅ Import conversion complete!"
echo ""
echo "🏗️  Running build to verify..."
npm run build
