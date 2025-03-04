function UserImage({ profileImage }: { profileImage: string }) {
  return (
    <img
      src={profileImage || `/userDefault.png`}
      alt="profile"
      className="w-8 h-8 rounded-full bg-slate-500"
    />
  );
}

export default UserImage;
