// components/Button.tsx
import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, PressableProps, View } from 'react-native';

import { Text } from './Text';

interface ButtonProps extends PressableProps {
  variant: string | undefined;
  size: string | undefined;
  children: ReactNode;
  loading?: boolean;
}

export function Button({ variant, size, children, loading, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      //className=
      disabled={disabled || loading}
      {...props}
    >
      <View>
        {loading && (
          <ActivityIndicator
            color={variant === 'primary' || variant === 'danger' ? 'white' : 'black'}
          />
        )}
        {typeof children === 'string' ? <Text>{children}</Text> : children}
      </View>
    </Pressable>
  );
}
