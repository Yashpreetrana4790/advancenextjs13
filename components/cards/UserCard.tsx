import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  user: {
    _id: string;
    clerkId: string;
    picture: string;
    name: string;
    username: string;
  };
}

const UserCard = ({ user }: Props) => {
  return (
    <Link
      href={`/profile/${user.clerkId}`}
      className="shadow-light100_darknone w-full max-xs:min-w-full xs:w-[260px]"
    >
      <article className="background-light900_ark200 light-border  items-center justify-center rounded-2xl p-8 flex w-full flex-col">
        <Image
          width={100}
          height={100}
          src={user?.picture}
          alt=""
          className="rounded-full"
        />
        <div className="mt-4 text-center">
          <h3 className="h3-bold text-white textdark200_light900 line-clamp-1">
            {user.name}
          </h3>
          <p className="body-regular text-dark500_light500 mt-2 ">
            @{user?.username}
          </p>
        </div>
      </article>
    </Link>
  );
};

export default UserCard;







