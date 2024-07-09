import React from 'react'
import { SignedIn, auth } from '@clerk/nextjs'
import { getUserById } from '@/lib/actions/user.action';
import Profile from '@/components/forms/Profile';

const Page = async () => {

  const { userId: clerkId } = auth();
  const userInfo = await getUserById({ userId : clerkId })
  return (
    <>

      <h1 className="h1-bold text-dark100_light900">All Users</h1>
      <div className='mt-9'>

        <Profile
        userId={clerkId}
        userInfo={JSON.stringify(userInfo)}
        />
      </div>
    </>
  )
}

export default Page