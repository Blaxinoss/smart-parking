import { Theme } from '@react-navigation/native';

// تعريف الخطوط بالشكل اللي React Navigation بيفهمه
const fontConfig = {
    regular: {
        fontFamily: 'Titillium_Reg',
        fontWeight: '400' as const,
    },
    medium: {
        fontFamily: 'Titillium_SemiBold',
        fontWeight: '500' as const,
    },
    bold: {
        fontFamily: 'Titillium_Bold',
        fontWeight: '700' as const,
    },
    heavy: {
        fontFamily: 'Titillium_Black',
        fontWeight: '900' as const,
    },
};

export const DarkTheme: Theme = {
    dark: true,
    colors: {
        primary: '#FAFAFA',
        background: '#0f0f0f',
        card: '#000000',
        text: 'rgb(229, 229, 231)',
        border: '#161616',
        notification: 'rgb(255, 69, 58)',
    },
    fonts: fontConfig,
};

export const DefaultTheme: Theme = {
    dark: false,
    colors: {
        primary: 'rgb(0, 122, 255)',
        background: 'rgb(242, 242, 242)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(28, 28, 30)',
        border: 'rgb(216, 216, 216)',
        notification: 'rgb(255, 59, 48)',
    },
    fonts: fontConfig, // ✅ نفس الكلام هنا
};


// /**
//  * Learn more about Light and Dark modes:
//  * https://docs.expo.io/guides/color-schemes/
//  */

// import { Text as DefaultText, View as DefaultView } from 'react-native';

// import Colors from '@/constants/Colors';
// import { useColorScheme } from './useColorScheme';

// type ThemeProps = {
//   lightColor?: string;
//   darkColor?: string;
// };

// export type TextProps = ThemeProps & DefaultText['props'];
// export type ViewProps = ThemeProps & DefaultView['props'];

// export function useThemeColor(
//   props: { light?: string; dark?: string },
//   colorName: keyof typeof Colors.light & keyof typeof Colors.dark
// ) {
//   const theme = useColorScheme() ?? 'light';
//   const colorFromProps = props[theme];

//   if (colorFromProps) {
//     return colorFromProps;
//   } else {
//     return Colors[theme][colorName];
//   }
// }

// export function Text(props: TextProps) {
//   const { style, lightColor, darkColor, ...otherProps } = props;
//   const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

//   return <DefaultText style={[{ color }, style]} {...otherProps} />;
// }

// export function View(props: ViewProps) {
//   const { style, lightColor, darkColor, ...otherProps } = props;
//   const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

//   return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
// }
