import * as React from 'react'
import { Text as RNText } from 'react-native'

const TextClassContext = React.createContext<string | undefined>(undefined)

// TODO: Variants

function Text({ ...props }: React.ComponentPropsWithoutRef<typeof RNText>) {
  const textClassName = React.useContext(TextClassContext)
  return <RNText {...props} />
}

export { Text, TextClassContext }
