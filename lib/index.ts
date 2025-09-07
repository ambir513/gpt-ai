"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

interface UserDataProp {
  id: string;
  special_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
}

export const CreateUser = async (data: UserDataProp) => {
  try {
    const isUserExist = await db.user.findUnique({
      where: {
        email: data?.email,
      },
    });
    if (isUserExist) return null;
    const user = await db.user.create({
      data: {
        ...data,
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const isUserExist = async () => {
  const user = await currentUser();
  if (!user) return null;
  if (user) {
    await CreateUser({
      special_id: user.id || "",
      first_name: user.firstName || "",
      last_name: user.lastName || "",
      email: user.primaryEmailAddress?.emailAddress,
      avatar: user.imageUrl,
    });
  }
};
