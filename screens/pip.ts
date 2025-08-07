import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ViewStyle,
  TextStyle,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  style?: ViewStyle;
  titleColor?: string;
  iconColor?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  rightIcon,
  onRightPress,
  style,
  titleColor,
  iconColor,
}) => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme(); // Detecta modo oscuro o claro

  const isDarkMode = colorScheme === 'dark';

  const dynamicStyles = StyleSheet.create({
    header: {
      padding: 12,
      backgroundColor: isDarkMode ? '#0a0a0a' : '#01579b',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      elevation: 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDarkMode ? '#333' : '#138d75',
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      color: titleColor || (isDarkMode ? '#f9fafb' : '#f9fafb'),
      marginTop: 2,
    },
    iconSpacer: {
      width: 32,
    },
  });

  return (
    <SafeAreaView>
      <View style={[dynamicStyles.header, style]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />

        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={iconColor || (isDarkMode ? '#f9fafb' : '#f9fafb')} />
          </TouchableOpacity>
        ) : (
          <View style={dynamicStyles.iconSpacer} />
        )}

        <Text style={dynamicStyles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default AppHeader;