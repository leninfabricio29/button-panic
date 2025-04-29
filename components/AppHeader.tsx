// components/AppHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ViewStyle, TextStyle } from 'react-native';
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
    <View style={[styles.header, style]}>
      <StatusBar barStyle="light-content"  />
      
      {showBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}

      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>

      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress}>
          <Ionicons name={rightIcon} size={24} color={iconColor} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
    height: Platform.OS === 'android' ? 30 + (StatusBar.currentHeight || 0) : 88,
    backgroundColor: '#01579b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#138d75',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
