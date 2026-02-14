import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ExternalLink } from './ExternalLink';

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View>
      <View style={styles.getStartedContainer}>

        {/* =================================================== */}
        {/* بداية اختبار NATIVEWIND */}
        {/* =================================================== */}

        <View className="w-full p-6 my-6 rounded-3xl border-4 bg-red-500 border-red-500 dark:bg-blue-900 dark:border-blue-400 items-center justify-center">

          {/* نص العنوان */}
          <Text className="text-2xl font- font-bold text-red-900 dark:text-blue-50">
            NativeWind Test
          </Text>

          {/* نص الشرح */}
          <Text className="text-base text-center mt-2 text-red-700 dark:text-blue-200">
            لو الخلفية حمراء = Light Mode {'\n'}
            لو الخلفية زرقاء = Dark Mode
          </Text>

        </View>

        {/* =================================================== */}
        {/* نهاية اختبار NATIVEWIND */}
        {/* =================================================== */}


        <Text style={styles.getStartedText}>
          Open up the code for this screen:
        </Text>

        <View
          style={[styles.codeHighlightContainer, styles.homeScreenFilename]}
          className="dark:bg-slate-800"
        >
          <Text className="font-titillium text-sm dark:text-white">{path}</Text>
        </View>

      </View>

      <View style={styles.helpContainer}>
        <ExternalLink
          className='font-titillium'
          style={styles.helpLink}
          href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet">
          <Text style={styles.helpLinkText}>
            Tap here if your app doesntt automatically update after making changes
          </Text>
        </ExternalLink>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    textAlign: 'center',
  },
});