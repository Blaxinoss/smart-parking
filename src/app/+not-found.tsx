import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { StyledText } from '@/components/ui/styledText';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <StyledText style={styles.title}>This screen does not exist.</StyledText>

        <Link href="/" style={styles.link}>
          <StyledText style={styles.linkText}>Go to home screen!</StyledText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
