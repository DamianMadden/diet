import { SymbolView } from 'expo-symbols'

import type { IconProps } from './types'

function Icon({
  materialCommunityIcon: _materialCommunityIcon,
  materialIcon: _materialIcon,
  sfSymbol,
  name,
  color,
  size = 24,
  ...props
}: IconProps) {
  return (
    <SymbolView
      name={name ?? 'questionmark'}
      tintColor={color ?? '#000000'}
      size={size}
      resizeMode="scaleAspectFit"
      {...props}
      {...sfSymbol}
    />
  )
}

export { Icon }
