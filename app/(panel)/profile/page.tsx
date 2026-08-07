import { api } from "@/app/lib/api";
import ProfileCard from "./components/ProfileCard";
import ProfileContainer from "./components/ProfileContainer";

// Sesuaikan interface dengan respons backend Anda
interface UserProfile {
  id: number;
  email: string;
  username: string | null;
  avatar: string | null;
  balance: number;
  role: string;
  createdAt: string;
  provider: string;
  _count?: {
    translations: number;
  };
}

export default async function ProfilePage() {
  // Panggil endpoint user yang sedang login (misal /users/me)
  const user = await api<UserProfile>('/user/me');

  return (
    <ProfileContainer user={user}>
        <ProfileCard user={user} />
    </ProfileContainer>
  );
}