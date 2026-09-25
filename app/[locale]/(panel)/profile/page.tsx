import { api } from "@/app/lib/api";
import ProfileCard from "./components/ProfileCard";
import ProfileContainer from "./components/ProfileContainer";
import { DEFAULT_LOCALE, isLocale } from "@/app/lib/i18n/locales";

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

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Panggil endpoint user yang sedang login (misal /users/me)
  const user = await api<UserProfile>('/user/me');

  return (
    <ProfileContainer user={user}>
        <ProfileCard user={user} locale={isLocale(locale) ? locale : DEFAULT_LOCALE} />
    </ProfileContainer>
  );
}