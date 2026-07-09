export interface ProfileOverride {
  name?: string;
  handle?: string;
  bio?: string;
  avatarUrl?: string;
}

const STORAGE_KEY = "profile-overrides-v1";

type OverrideMap = Record<string, ProfileOverride>;

const readMap = (): OverrideMap => {
  const stored = uni.getStorageSync(STORAGE_KEY);
  return stored && typeof stored === "object" ? (stored as OverrideMap) : {};
};

export const getProfileOverride = (userId: string): ProfileOverride =>
  readMap()[userId] ?? {};

export const setProfileOverride = (
  userId: string,
  override: ProfileOverride
) => {
  const map = readMap();
  map[userId] = override;
  uni.setStorageSync(STORAGE_KEY, map);
};
