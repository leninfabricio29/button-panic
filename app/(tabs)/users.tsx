import UsersListScreen from '@/screens/UsersListScreen';

import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const navigation = useNavigation();
  return <UsersListScreen />;
}