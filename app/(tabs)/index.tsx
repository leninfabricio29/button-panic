import HomeScreen from '@/screens/HomeScreen';

import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const navigation = useNavigation();
  return <HomeScreen  />;
}