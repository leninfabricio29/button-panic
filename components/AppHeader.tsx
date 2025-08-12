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
  titleColor = '#f9fafb',
  iconColor = '#f9fafb',
}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView >
      <View style={[styles.header, style]}>
        <StatusBar barStyle="light-content"  />

        {/* Back Button or spacer */}
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconSpacer} />
        )}

        {/* Title */}
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  header: {
    padding: 12,
    backgroundColor:  '#01579b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#138d75',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2
  },
  iconSpacer: {
    width: 32, // igual al tamaño de un ícono para centrar
  },
});
